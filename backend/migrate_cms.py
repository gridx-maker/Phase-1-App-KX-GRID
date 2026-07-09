from pymongo import MongoClient

client = MongoClient('mongodb://localhost:27017')
db = client['test_database']

# Migrate: Add 'page' field based on 'section' field
mappings = {
    'programme_director': 'programme_director',
    'contact': 'contact_info',
}

for doc in db.cms_content.find({'section': {'$exists': True}, 'page': {'$exists': False}}):
    section = doc.get('section')
    page_val = mappings.get(section, section)
    result = db.cms_content.update_one(
        {'_id': doc['_id']},
        {'$set': {'page': page_val}}
    )
    print(f'  Migrated section={section} -> page={page_val}')

# Verify
print('\nAfter migration:')
for doc in db.cms_content.find({}, {'_id': 0}):
    print(f'  section={doc.get("section")} | page={doc.get("page")} | name={doc.get("name","-")}')
