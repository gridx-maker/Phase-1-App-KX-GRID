# ============================================================
# KXGRID — Router: KXCRAFT
# ============================================================

from fastapi import APIRouter, Depends, HTTPException, Request, Response, UploadFile, File
from fastapi.responses import StreamingResponse
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta
import uuid
import logging
import os
import base64
import io
import csv
import random
import string
import qrcode
from openpyxl import Workbook
import resend

# Core configurations
from core.database import db
from core.config import twilio_client, SENDER_EMAIL, resend as resend_client
from core.security import get_current_user, hash_password, verify_password, create_token, otp_store

# Shared models
from models import *

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/kxcraft/products")
async def get_kxcraft_products():
    products = await db.kxcraft_products.find({"is_visible": True}, {"_id": 0}).sort("order", 1).to_list(100)
    return products

@router.get("/kxcraft/products/all")
async def get_all_kxcraft_products():
    products = await db.kxcraft_products.find({}, {"_id": 0}).sort("order", 1).to_list(100)
    return products

@router.post("/admin/kxcraft/products")
async def create_kxcraft_product(product: KXCraftProductCreate, user: dict = Depends(get_current_user)):
    if user.get("role") not in ["admin", "root"]:
        raise HTTPException(status_code=403, detail="Admin access required")
    product_data = product.dict()
    product_data["product_id"] = f"kxcraft_{uuid.uuid4().hex[:8]}"
    product_data["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.kxcraft_products.insert_one(product_data)
    product_data.pop("_id", None)
    return product_data

@router.put("/admin/kxcraft/products/{product_id}")
async def update_kxcraft_product(product_id: str, product: KXCraftProductCreate, user: dict = Depends(get_current_user)):
    if user.get("role") not in ["admin", "root"]:
        raise HTTPException(status_code=403, detail="Admin access required")
    update_data = product.dict()
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.kxcraft_products.update_one(
        {"product_id": product_id},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product updated"}

@router.delete("/admin/kxcraft/products/{product_id}")
async def delete_kxcraft_product(product_id: str, user: dict = Depends(get_current_user)):
    if user.get("role") not in ["admin", "root"]:
        raise HTTPException(status_code=403, detail="Admin access required")
    result = await db.kxcraft_products.delete_one({"product_id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted"}

@router.get("/kxcraft/categories")
async def get_kxcraft_categories():
    categories = await db.kxcraft_products.distinct("category")
    return categories
