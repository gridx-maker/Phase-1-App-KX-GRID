import os
import uuid
import json
import logging
import asyncio
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

load_dotenv()

# ------------------------------------------------------------
# Helper for building SQL WHERE clause from Mongo-like queries
# ------------------------------------------------------------
def build_where_clause(query: dict, param_offset: int = 1) -> tuple[str, list]:
    if not query:
        return "TRUE", []
    
    clauses = []
    params = []
    
    def to_str_param(v):
        if isinstance(v, bool):
            return "true" if v else "false"
        return str(v)

    def process_item(key, val):
        nonlocal param_offset
        if key == "$or":
            or_clauses = []
            for sub_query in val:
                sub_clause, sub_params = build_where_clause(sub_query, param_offset)
                or_clauses.append(f"({sub_clause})")
                params.extend(sub_params)
                param_offset += len(sub_params)
            return f"({' OR '.join(or_clauses)})"
        
        elif key == "$and":
            and_clauses = []
            for sub_query in val:
                sub_clause, sub_params = build_where_clause(sub_query, param_offset)
                and_clauses.append(f"({sub_clause})")
                params.extend(sub_params)
                param_offset += len(sub_params)
            return f"({' AND '.join(and_clauses)})"
            
        elif isinstance(val, dict):
            field_clause = []
            for op, op_val in val.items():
                if op == "$ne":
                    if op_val == [] or op_val == {}:
                        field_clause.append(f"(data->>'{key}' IS NOT NULL AND data->>'{key}' != '{json.dumps(op_val)}')")
                    else:
                        field_clause.append(f"(data->>'{key}' IS NULL OR data->>'{key}' != ${param_offset})")
                        params.append(to_str_param(op_val))
                        param_offset += 1
                elif op == "$eq":
                    field_clause.append(f"data->>'{key}' = ${param_offset}")
                    params.append(to_str_param(op_val))
                    param_offset += 1
                elif op == "$in":
                    field_clause.append(f"data->>'{key}' = ANY(${param_offset})")
                    params.append([to_str_param(x) for x in op_val])
                    param_offset += 1
                elif op == "$exists":
                    if op_val:
                        field_clause.append(f"data ? '{key}'")
                    else:
                        field_clause.append(f"NOT (data ? '{key}')")
                elif op in ("$gt", "$gte", "$lt", "$lte"):
                    sql_op = {"$gt": ">", "$gte": ">=", "$lt": "<", "$lte": "<="}[op]
                    field_clause.append(f"coalesce((data->>'{key}')::numeric, 0) {sql_op} ${param_offset}")
                    params.append(float(op_val))
                    param_offset += 1
            return f"({' AND '.join(field_clause)})"
        else:
            if val is None:
                return f"NOT (data ? '{key}')"
            else:
                clause = f"data->>'{key}' = ${param_offset}"
                params.append(to_str_param(val))
                param_offset += 1
                return clause

    for k, v in query.items():
        clauses.append(process_item(k, v))
        
    return ' AND '.join(clauses), params

# ------------------------------------------------------------
# Helper for cleaning datetime and serializing documents
# ------------------------------------------------------------
def clean_doc(doc):
    if isinstance(doc, dict):
        return {k: clean_doc(v) for k, v in doc.items()}
    elif isinstance(doc, list):
        return [clean_doc(v) for v in doc]
    elif isinstance(doc, datetime):
        return doc.isoformat()
    return doc

COLLECTION_ID_KEYS = {
    "users": "user_id",
    "students": "student_id",
    "programs": "program_id",
    "batches": "batch_id",
    "attendance": "attendance_id",
    "assessments": "assessment_id",
    "certificates": "certificate_id",
    "team_members": "member_id",
    "kxcraft_products": "product_id",
    "careers": "career_id",
    "promo_banners": "banner_id",
    "workshop_registrations": "registration_id",
    "partners": "partner_id",
    "site_settings": "setting_id",
    "callback_requests": "request_id",
    "attendance_sessions": "session_id",
    "assessment_categories": "category_id",
    "admin_messages": "message_id",
    "brands": "brand_id",
    "media_gallery": "media_id",
    "nfc_cards": "nfc_card_id",
    "nfc_users": "nfc_id",
    "program_units": "unit_id",
    "session_attendance": "attendance_id",
    "upgrades": "upgrade_id",
    "leads": "lead_id"
}

def get_doc_id(doc: dict, collection_name: str = None) -> str:
    # 1. Check for explicit _id first
    if "_id" in doc:
        return str(doc["_id"])
    
    # 2. Check for collection-specific natural key
    if collection_name and collection_name in COLLECTION_ID_KEYS:
        key = COLLECTION_ID_KEYS[collection_name]
        if key in doc:
            return str(doc[key])
            
    # 3. Check generic 'id'
    if "id" in doc:
        return str(doc["id"])
        
    # 4. Fallback: generate a new UUID
    val = uuid.uuid4().hex
    doc["_id"] = val
    return val

# ------------------------------------------------------------
# Python-side operations wrapper for update logic
# ------------------------------------------------------------
def apply_update(data: dict, update: dict) -> dict:
    new_data = dict(data)
    for op, fields in update.items():
        if op == "$set":
            for k, v in fields.items():
                new_data[k] = v
        elif op == "$unset":
            for k in fields:
                new_data.pop(k, None)
        elif op == "$push":
            for k, v in fields.items():
                if k not in new_data or not isinstance(new_data[k], list):
                    new_data[k] = []
                new_data[k].append(v)
        elif op == "$addToSet":
            for k, v in fields.items():
                if k not in new_data or not isinstance(new_data[k], list):
                    new_data[k] = []
                if v not in new_data[k]:
                    new_data[k].append(v)
        elif op == "$pull":
            for k, v in fields.items():
                if k in new_data and isinstance(new_data[k], list):
                    new_data[k] = [item for item in new_data[k] if item != v]
    return new_data

# ------------------------------------------------------------
# MongoDB Mock classes for insertion/deletion results
# ------------------------------------------------------------
class InsertOneResult:
    def __init__(self, inserted_id):
        self.inserted_id = inserted_id

class InsertManyResult:
    def __init__(self, inserted_ids):
        self.inserted_ids = inserted_ids

class UpdateResult:
    def __init__(self, matched_count, modified_count, upserted_id=None):
        self.matched_count = matched_count
        self.modified_count = modified_count
        self.upserted_id = upserted_id

class DeleteResult:
    def __init__(self, deleted_count):
        self.deleted_count = deleted_count

# ------------------------------------------------------------
# MongoDB Cursor Mock
# ------------------------------------------------------------
class PostgresCursor:
    def __init__(self, pool, table_name, query, projection=None):
        self.pool = pool
        self.table_name = table_name
        self.query = query or {}
        self.projection = projection
        self._sort_field = None
        self._sort_dir = 1
        self._limit = None
        
    def sort(self, field, direction=1):
        self._sort_field = field
        self._sort_dir = direction
        return self
        
    def limit(self, limit_num):
        self._limit = limit_num
        return self
        
    async def to_list(self, length=None):
        where_clause, params = build_where_clause(self.query)
        sql = f"SELECT data FROM {self.table_name} WHERE {where_clause}"
        
        if self._sort_field:
            order = "ASC" if self._sort_dir == 1 else "DESC"
            sql += f" ORDER BY (data->>'{self._sort_field}') {order}"
            
        limit_val = self._limit if self._limit is not None else length
        if limit_val is not None:
            sql += f" LIMIT {limit_val}"
            
        async with self.pool.acquire() as conn:
            rows = await conn.fetch(sql, *params)
        
        results = []
        for r in rows:
            # asyncpg automatically decodes jsonb to Python dict/list
            data = r['data']
            if isinstance(data, str):
                data = json.loads(data)
            results.append(data)
        return results

# ------------------------------------------------------------
# MongoDB Collection Mock
# ------------------------------------------------------------
class PostgresCollection:
    def __init__(self, pool_getter, name):
        self.pool_getter = pool_getter
        self.name = name

    @property
    def pool(self):
        return self.pool_getter()

    async def find_one(self, query=None, projection=None):
        if query is None:
            query = {}
        where_clause, params = build_where_clause(query)
        sql = f"SELECT data FROM {self.name} WHERE {where_clause} LIMIT 1"
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow(sql, *params)
        if row:
            data = row['data']
            if isinstance(data, str):
                data = json.loads(data)
            return data
        return None

    def find(self, query=None, projection=None):
        return PostgresCursor(self.pool, self.name, query, projection)

    async def insert_one(self, doc):
        doc_id = get_doc_id(doc, self.name)
        doc_copy = dict(doc)
        if "_id" not in doc_copy:
            doc_copy["_id"] = doc_id
        doc_copy = clean_doc(doc_copy)
        
        sql = f"""
            INSERT INTO {self.name} (id, data)
            VALUES ($1, $2)
            ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = CURRENT_TIMESTAMP
        """
        async with self.pool.acquire() as conn:
            await conn.execute(sql, doc_id, json.dumps(doc_copy))
        return InsertOneResult(doc_id)

    async def insert_many(self, docs):
        inserted_ids = []
        async with self.pool.acquire() as conn:
            async with conn.transaction():
                for doc in docs:
                    doc_id = get_doc_id(doc, self.name)
                    doc_copy = dict(doc)
                    if "_id" not in doc_copy:
                        doc_copy["_id"] = doc_id
                    doc_copy = clean_doc(doc_copy)
                    sql = f"""
                        INSERT INTO {self.name} (id, data)
                        VALUES ($1, $2)
                        ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = CURRENT_TIMESTAMP
                    """
                    await conn.execute(sql, doc_id, json.dumps(doc_copy))
                    inserted_ids.append(doc_id)
        return InsertManyResult(inserted_ids)

    async def update_one(self, query, update, upsert=False):
        where_clause, params = build_where_clause(query)
        sql = f"SELECT id, data FROM {self.name} WHERE {where_clause} LIMIT 1"
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow(sql, *params)
            if row:
                doc_id = row['id']
                data = row['data']
                if isinstance(data, str):
                    data = json.loads(data)
                updated_data = apply_update(data, update)
                updated_data = clean_doc(updated_data)
                await conn.execute(
                    f"UPDATE {self.name} SET data = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
                    json.dumps(updated_data), doc_id
                )
                return UpdateResult(matched_count=1, modified_count=1)
            elif upsert:
                base_doc = {k: v for k, v in query.items() if not k.startswith("$")}
                updated_data = apply_update(base_doc, update)
                doc_id = get_doc_id(updated_data, self.name)
                if "_id" not in updated_data:
                    updated_data["_id"] = doc_id
                updated_data = clean_doc(updated_data)
                await conn.execute(
                    f"INSERT INTO {self.name} (id, data) VALUES ($1, $2)",
                    doc_id, json.dumps(updated_data)
                )
                return UpdateResult(matched_count=0, modified_count=1, upserted_id=doc_id)
        return UpdateResult(matched_count=0, modified_count=0)

    async def update_many(self, query, update):
        where_clause, params = build_where_clause(query)
        sql = f"SELECT id, data FROM {self.name} WHERE {where_clause}"
        async with self.pool.acquire() as conn:
            rows = await conn.fetch(sql, *params)
            modified = 0
            for row in rows:
                doc_id = row['id']
                data = row['data']
                if isinstance(data, str):
                    data = json.loads(data)
                updated_data = apply_update(data, update)
                updated_data = clean_doc(updated_data)
                await conn.execute(
                    f"UPDATE {self.name} SET data = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
                    json.dumps(updated_data), doc_id
                )
                modified += 1
        return UpdateResult(matched_count=len(rows), modified_count=modified)

    async def delete_one(self, query):
        where_clause, params = build_where_clause(query)
        sql_get = f"SELECT id FROM {self.name} WHERE {where_clause} LIMIT 1"
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow(sql_get, *params)
            if row:
                doc_id = row['id']
                await conn.execute(f"DELETE FROM {self.name} WHERE id = $1", doc_id)
                return DeleteResult(deleted_count=1)
        return DeleteResult(deleted_count=0)

    async def delete_many(self, query):
        where_clause, params = build_where_clause(query)
        sql = f"DELETE FROM {self.name} WHERE {where_clause}"
        async with self.pool.acquire() as conn:
            res = await conn.execute(sql, *params)
            count = 0
            # postgres delete response syntax is e.g. "DELETE 5"
            if res.startswith("DELETE "):
                count = int(res.split()[1])
        return DeleteResult(deleted_count=count)

    async def count_documents(self, query):
        where_clause, params = build_where_clause(query)
        sql = f"SELECT COUNT(*) FROM {self.name} WHERE {where_clause}"
        async with self.pool.acquire() as conn:
            count = await conn.fetchval(sql, *params)
        return count

    def aggregate(self, pipeline):
        class AggregationResult:
            def __init__(self, coll):
                self.coll = coll
            async def to_list(self, limit):
                total = await self.coll.count_documents({})
                return [{"total": total}]
        return AggregationResult(self)

# ------------------------------------------------------------
# Client / Database Mock
# ------------------------------------------------------------
class PostgresDatabase:
    def __init__(self):
        self.pool = None
        self._collections = {}
        
    async def init_pool(self, postgres_url: str):
        import asyncpg
        from urllib.parse import urlparse, urlunparse
        
        parsed = urlparse(postgres_url)
        db_name = parsed.path.lstrip('/') or "kxgrid_db"
        
        # Force default db connection first to check and create target DB
        postgres_default_path = parsed._replace(path='/postgres')
        postgres_default_url = urlunparse(postgres_default_path)
        
        try:
            temp_conn = await asyncpg.connect(postgres_default_url)
            exists = await temp_conn.fetchval(
                "SELECT EXISTS(SELECT 1 FROM pg_database WHERE datname = $1)", db_name
            )
            if not exists:
                await temp_conn.execute(f"CREATE DATABASE {db_name}")
                logger.info(f"Database '{db_name}' created successfully.")
            await temp_conn.close()
        except Exception as e:
            logger.warning(f"Could not verify/create database '{db_name}' on default connection: {e}")

        self.pool = await asyncpg.create_pool(postgres_url)
        TABLES = [
            "users", "students", "programs", "batches", "attendance", "assessments",
            "certificates", "leaderboard", "team_members", "kxcraft_products",
            "careers", "promo_banners", "workshop_registrations", "partners",
            "cms_content", "site_settings", "callback_requests", "re_classes",
            "user_sessions", "attendance_sessions", "assessment_categories", "nfc_assessments",
            "admin_messages", "brands", "media_gallery", "nfc_cards", "nfc_users",
            "otp_requests", "pending_nfc_deletions", "program_units", "reclasses",
            "session_attendance", "student_progress", "upgrades", "leads"
        ]
        async with self.pool.acquire() as conn:
            for t in TABLES:
                await conn.execute(f"""
                    CREATE TABLE IF NOT EXISTS {t} (
                        id TEXT PRIMARY KEY,
                        data JSONB,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                    );
                """)
        logger.info("PostgreSQL document store initialized successfully.")

    def close(self):
        # Async closing of connection pool is handled inside an event loop
        # We can schedule the close or close it synchronously/asynchronously
        if self.pool:
            asyncio.create_task(self.pool.close())

    def __getattr__(self, name):
        if name not in self._collections:
            self._collections[name] = PostgresCollection(lambda: self.pool, name)
        return self._collections[name]
        
    def __getitem__(self, name):
        return getattr(self, name)

# Instantiate globals
client = PostgresDatabase()
db = client
