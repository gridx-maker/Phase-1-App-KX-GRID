"""
Brand Management System Tests
Tests for CRUD operations on brands, visibility toggle, logo upload, and seed functionality
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://unified-dashboard-48.preview.emergentagent.com')

class TestBrandManagement:
    """Brand Management API Tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test fixtures"""
        self.admin_email = "admin@kotlerx.com"
        self.admin_password = "admin123"
        self.student_email = "teststudent@kotlerx.com"
        self.student_password = "student123"
        self.admin_token = None
        self.student_token = None
        
    def get_admin_token(self):
        """Get admin authentication token"""
        if self.admin_token:
            return self.admin_token
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": self.admin_email,
            "password": self.admin_password
        })
        if response.status_code == 200:
            self.admin_token = response.json().get("token")
            return self.admin_token
        pytest.skip("Admin authentication failed")
        
    def get_student_token(self):
        """Get student authentication token"""
        if self.student_token:
            return self.student_token
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": self.student_email,
            "password": self.student_password
        })
        if response.status_code == 200:
            self.student_token = response.json().get("token")
            return self.student_token
        # Create student if doesn't exist
        register_response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": self.student_email,
            "password": self.student_password,
            "name": "Test Student",
            "role": "student"
        })
        if register_response.status_code == 200:
            self.student_token = register_response.json().get("token")
            return self.student_token
        pytest.skip("Student authentication failed")
    
    # ==================== PUBLIC BRANDS ENDPOINT ====================
    
    def test_public_brands_endpoint_returns_200(self):
        """Test GET /api/brands returns 200 (public endpoint)"""
        response = requests.get(f"{BASE_URL}/api/brands")
        assert response.status_code == 200
        print(f"✓ Public brands endpoint returns 200")
        
    def test_public_brands_returns_list(self):
        """Test GET /api/brands returns a list of brands"""
        response = requests.get(f"{BASE_URL}/api/brands")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Public brands returns list with {len(data)} brands")
        
    def test_public_brands_only_returns_visible(self):
        """Test GET /api/brands only returns visible brands"""
        response = requests.get(f"{BASE_URL}/api/brands")
        assert response.status_code == 200
        brands = response.json()
        for brand in brands:
            assert brand.get("is_visible") == True, f"Brand {brand.get('name')} should be visible"
        print(f"✓ All {len(brands)} public brands are visible")
        
    def test_public_brands_have_required_fields(self):
        """Test public brands have required fields"""
        response = requests.get(f"{BASE_URL}/api/brands")
        assert response.status_code == 200
        brands = response.json()
        if len(brands) > 0:
            brand = brands[0]
            required_fields = ["brand_id", "name", "description", "color", "is_visible"]
            for field in required_fields:
                assert field in brand, f"Missing field: {field}"
            print(f"✓ Brands have all required fields: {required_fields}")
        else:
            print("⚠ No brands to verify fields")
            
    # ==================== ADMIN BRANDS ENDPOINT ====================
    
    def test_admin_brands_requires_auth(self):
        """Test GET /api/admin/brands requires authentication"""
        response = requests.get(f"{BASE_URL}/api/admin/brands")
        assert response.status_code == 401
        print(f"✓ Admin brands endpoint requires authentication (401)")
        
    def test_admin_brands_requires_admin_role(self):
        """Test GET /api/admin/brands requires admin role"""
        token = self.get_student_token()
        if not token:
            pytest.skip("Student token not available")
        response = requests.get(
            f"{BASE_URL}/api/admin/brands",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 403
        print(f"✓ Admin brands endpoint requires admin role (403)")
        
    def test_admin_brands_returns_all_brands(self):
        """Test GET /api/admin/brands returns all brands including hidden"""
        token = self.get_admin_token()
        response = requests.get(
            f"{BASE_URL}/api/admin/brands",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        brands = response.json()
        assert isinstance(brands, list)
        print(f"✓ Admin brands returns {len(brands)} brands (including hidden)")
        
    # ==================== CREATE BRAND ====================
    
    def test_create_brand_requires_auth(self):
        """Test POST /api/admin/brands requires authentication"""
        response = requests.post(
            f"{BASE_URL}/api/admin/brands",
            json={"name": "Test Brand", "description": "Test", "color": "#ff0000"}
        )
        assert response.status_code == 401
        print(f"✓ Create brand requires authentication (401)")
        
    def test_create_brand_success(self):
        """Test admin can create a new brand"""
        token = self.get_admin_token()
        unique_name = f"TEST_Brand_{uuid.uuid4().hex[:8]}"
        response = requests.post(
            f"{BASE_URL}/api/admin/brands",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "name": unique_name,
                "description": "Test brand description",
                "color": "#ff5500",
                "order": 99,
                "is_visible": True
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("name") == unique_name
        assert data.get("color") == "#ff5500"
        assert "brand_id" in data
        print(f"✓ Created brand: {unique_name} with id {data.get('brand_id')}")
        
        # Cleanup - delete the test brand
        brand_id = data.get("brand_id")
        requests.delete(
            f"{BASE_URL}/api/admin/brands/{brand_id}",
            headers={"Authorization": f"Bearer {token}"}
        )
        
    def test_create_brand_with_minimal_data(self):
        """Test creating brand with only required field (name)"""
        token = self.get_admin_token()
        unique_name = f"TEST_MinBrand_{uuid.uuid4().hex[:8]}"
        response = requests.post(
            f"{BASE_URL}/api/admin/brands",
            headers={"Authorization": f"Bearer {token}"},
            json={"name": unique_name}
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("name") == unique_name
        assert data.get("color") == "#00f0ff"  # Default color
        assert data.get("is_visible") == True  # Default visibility
        print(f"✓ Created brand with minimal data, defaults applied")
        
        # Cleanup
        brand_id = data.get("brand_id")
        requests.delete(
            f"{BASE_URL}/api/admin/brands/{brand_id}",
            headers={"Authorization": f"Bearer {token}"}
        )
        
    # ==================== UPDATE BRAND ====================
    
    def test_update_brand_success(self):
        """Test admin can update an existing brand"""
        token = self.get_admin_token()
        
        # First create a brand
        unique_name = f"TEST_UpdateBrand_{uuid.uuid4().hex[:8]}"
        create_response = requests.post(
            f"{BASE_URL}/api/admin/brands",
            headers={"Authorization": f"Bearer {token}"},
            json={"name": unique_name, "description": "Original description"}
        )
        assert create_response.status_code == 200
        brand_id = create_response.json().get("brand_id")
        
        # Update the brand
        update_response = requests.put(
            f"{BASE_URL}/api/admin/brands/{brand_id}",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "name": f"{unique_name}_Updated",
                "description": "Updated description",
                "color": "#00ff00"
            }
        )
        assert update_response.status_code == 200
        print(f"✓ Updated brand {brand_id}")
        
        # Verify update
        get_response = requests.get(
            f"{BASE_URL}/api/admin/brands/{brand_id}",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert get_response.status_code == 200
        updated_brand = get_response.json()
        assert updated_brand.get("description") == "Updated description"
        assert updated_brand.get("color") == "#00ff00"
        print(f"✓ Verified brand update persisted")
        
        # Cleanup
        requests.delete(
            f"{BASE_URL}/api/admin/brands/{brand_id}",
            headers={"Authorization": f"Bearer {token}"}
        )
        
    def test_update_nonexistent_brand_returns_404(self):
        """Test updating non-existent brand returns 404"""
        token = self.get_admin_token()
        response = requests.put(
            f"{BASE_URL}/api/admin/brands/brand_nonexistent123",
            headers={"Authorization": f"Bearer {token}"},
            json={"name": "Test"}
        )
        assert response.status_code == 404
        print(f"✓ Update non-existent brand returns 404")
        
    # ==================== DELETE BRAND ====================
    
    def test_delete_brand_success(self):
        """Test admin can delete a brand"""
        token = self.get_admin_token()
        
        # First create a brand
        unique_name = f"TEST_DeleteBrand_{uuid.uuid4().hex[:8]}"
        create_response = requests.post(
            f"{BASE_URL}/api/admin/brands",
            headers={"Authorization": f"Bearer {token}"},
            json={"name": unique_name}
        )
        assert create_response.status_code == 200
        brand_id = create_response.json().get("brand_id")
        
        # Delete the brand
        delete_response = requests.delete(
            f"{BASE_URL}/api/admin/brands/{brand_id}",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert delete_response.status_code == 200
        print(f"✓ Deleted brand {brand_id}")
        
        # Verify deletion
        get_response = requests.get(
            f"{BASE_URL}/api/admin/brands/{brand_id}",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert get_response.status_code == 404
        print(f"✓ Verified brand deletion (404 on GET)")
        
    def test_delete_nonexistent_brand_returns_404(self):
        """Test deleting non-existent brand returns 404"""
        token = self.get_admin_token()
        response = requests.delete(
            f"{BASE_URL}/api/admin/brands/brand_nonexistent123",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 404
        print(f"✓ Delete non-existent brand returns 404")
        
    # ==================== VISIBILITY TOGGLE ====================
    
    def test_toggle_brand_visibility(self):
        """Test admin can toggle brand visibility"""
        token = self.get_admin_token()
        
        # Create a visible brand
        unique_name = f"TEST_VisibilityBrand_{uuid.uuid4().hex[:8]}"
        create_response = requests.post(
            f"{BASE_URL}/api/admin/brands",
            headers={"Authorization": f"Bearer {token}"},
            json={"name": unique_name, "is_visible": True}
        )
        assert create_response.status_code == 200
        brand_id = create_response.json().get("brand_id")
        
        # Hide the brand
        hide_response = requests.put(
            f"{BASE_URL}/api/admin/brands/{brand_id}",
            headers={"Authorization": f"Bearer {token}"},
            json={"is_visible": False}
        )
        assert hide_response.status_code == 200
        print(f"✓ Set brand visibility to False")
        
        # Verify hidden brand not in public endpoint
        public_response = requests.get(f"{BASE_URL}/api/brands")
        public_brands = public_response.json()
        brand_ids = [b.get("brand_id") for b in public_brands]
        assert brand_id not in brand_ids, "Hidden brand should not appear in public endpoint"
        print(f"✓ Hidden brand not visible in public endpoint")
        
        # Verify hidden brand still in admin endpoint
        admin_response = requests.get(
            f"{BASE_URL}/api/admin/brands",
            headers={"Authorization": f"Bearer {token}"}
        )
        admin_brands = admin_response.json()
        admin_brand_ids = [b.get("brand_id") for b in admin_brands]
        assert brand_id in admin_brand_ids, "Hidden brand should appear in admin endpoint"
        print(f"✓ Hidden brand visible in admin endpoint")
        
        # Show the brand again
        show_response = requests.put(
            f"{BASE_URL}/api/admin/brands/{brand_id}",
            headers={"Authorization": f"Bearer {token}"},
            json={"is_visible": True}
        )
        assert show_response.status_code == 200
        print(f"✓ Set brand visibility back to True")
        
        # Cleanup
        requests.delete(
            f"{BASE_URL}/api/admin/brands/{brand_id}",
            headers={"Authorization": f"Bearer {token}"}
        )
        
    # ==================== SEED DEFAULT BRANDS ====================
    
    def test_seed_defaults_requires_admin(self):
        """Test seed defaults requires admin authentication"""
        response = requests.post(f"{BASE_URL}/api/admin/brands/seed-defaults")
        assert response.status_code == 401
        print(f"✓ Seed defaults requires authentication (401)")
        
    def test_seed_defaults_when_brands_exist(self):
        """Test seed defaults returns message when brands already exist"""
        token = self.get_admin_token()
        response = requests.post(
            f"{BASE_URL}/api/admin/brands/seed-defaults",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()
        # Should indicate brands already exist
        assert "already exist" in data.get("message", "").lower() or data.get("seeded") == 0
        print(f"✓ Seed defaults handles existing brands: {data.get('message')}")
        
    # ==================== LOGO UPLOAD ====================
    
    def test_logo_upload_requires_auth(self):
        """Test logo upload requires authentication"""
        response = requests.post(
            f"{BASE_URL}/api/admin/brands/brand_test123/logo",
            files={"file": ("test.png", b"fake image data", "image/png")}
        )
        assert response.status_code == 401
        print(f"✓ Logo upload requires authentication (401)")
        
    def test_logo_upload_validates_file_type(self):
        """Test logo upload validates file is an image"""
        token = self.get_admin_token()
        
        # Get an existing brand
        brands_response = requests.get(
            f"{BASE_URL}/api/admin/brands",
            headers={"Authorization": f"Bearer {token}"}
        )
        brands = brands_response.json()
        if len(brands) == 0:
            pytest.skip("No brands available for logo upload test")
            
        brand_id = brands[0].get("brand_id")
        
        # Try uploading non-image file
        response = requests.post(
            f"{BASE_URL}/api/admin/brands/{brand_id}/logo",
            headers={"Authorization": f"Bearer {token}"},
            files={"file": ("test.txt", b"not an image", "text/plain")}
        )
        assert response.status_code == 400
        print(f"✓ Logo upload rejects non-image files (400)")
        
    def test_logo_delete_requires_auth(self):
        """Test logo delete requires authentication"""
        response = requests.delete(f"{BASE_URL}/api/admin/brands/brand_test123/logo")
        assert response.status_code == 401
        print(f"✓ Logo delete requires authentication (401)")
        
    # ==================== GET SINGLE BRAND ====================
    
    def test_get_single_brand_success(self):
        """Test admin can get a single brand by ID"""
        token = self.get_admin_token()
        
        # Get all brands first
        brands_response = requests.get(
            f"{BASE_URL}/api/admin/brands",
            headers={"Authorization": f"Bearer {token}"}
        )
        brands = brands_response.json()
        if len(brands) == 0:
            pytest.skip("No brands available")
            
        brand_id = brands[0].get("brand_id")
        
        # Get single brand
        response = requests.get(
            f"{BASE_URL}/api/admin/brands/{brand_id}",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        brand = response.json()
        assert brand.get("brand_id") == brand_id
        print(f"✓ Got single brand: {brand.get('name')}")
        
    def test_get_nonexistent_brand_returns_404(self):
        """Test getting non-existent brand returns 404"""
        token = self.get_admin_token()
        response = requests.get(
            f"{BASE_URL}/api/admin/brands/brand_nonexistent123",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 404
        print(f"✓ Get non-existent brand returns 404")
        
    # ==================== VERIFY 13 DEFAULT BRANDS ====================
    
    def test_default_brands_count(self):
        """Test that 13 default KX brands are seeded"""
        response = requests.get(f"{BASE_URL}/api/brands")
        assert response.status_code == 200
        brands = response.json()
        # Should have at least 13 default brands
        assert len(brands) >= 13, f"Expected at least 13 brands, got {len(brands)}"
        print(f"✓ Found {len(brands)} brands (expected >= 13)")
        
    def test_default_brands_names(self):
        """Test that default KX brand names are present"""
        response = requests.get(f"{BASE_URL}/api/brands")
        assert response.status_code == 200
        brands = response.json()
        brand_names = [b.get("name") for b in brands]
        
        expected_brands = [
            "KX CORE", "KX PRO", "KX LAB", "KX MEDIA", "KX TECH",
            "KX RACING", "KX BUSINESS", "KX ACADEMY", "KX EVENTS",
            "KX DESIGN", "KX SAFETY", "KX GLOBAL", "KX PARTNERS"
        ]
        
        for expected in expected_brands:
            assert expected in brand_names, f"Missing brand: {expected}"
        print(f"✓ All 13 default KX brands present")


class TestBrandIntegration:
    """Integration tests for brand management"""
    
    def get_admin_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@kotlerx.com",
            "password": "admin123"
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Admin authentication failed")
        
    def test_full_brand_crud_flow(self):
        """Test complete Create-Read-Update-Delete flow for a brand"""
        token = self.get_admin_token()
        unique_name = f"TEST_CRUD_Brand_{uuid.uuid4().hex[:8]}"
        
        # CREATE
        create_response = requests.post(
            f"{BASE_URL}/api/admin/brands",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "name": unique_name,
                "description": "CRUD test brand",
                "color": "#123456",
                "is_visible": True
            }
        )
        assert create_response.status_code == 200
        brand_id = create_response.json().get("brand_id")
        print(f"✓ CREATE: Brand {brand_id} created")
        
        # READ
        read_response = requests.get(
            f"{BASE_URL}/api/admin/brands/{brand_id}",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert read_response.status_code == 200
        brand = read_response.json()
        assert brand.get("name") == unique_name
        assert brand.get("color") == "#123456"
        print(f"✓ READ: Brand data verified")
        
        # UPDATE
        update_response = requests.put(
            f"{BASE_URL}/api/admin/brands/{brand_id}",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "description": "Updated CRUD test brand",
                "color": "#654321"
            }
        )
        assert update_response.status_code == 200
        print(f"✓ UPDATE: Brand updated")
        
        # Verify UPDATE
        verify_response = requests.get(
            f"{BASE_URL}/api/admin/brands/{brand_id}",
            headers={"Authorization": f"Bearer {token}"}
        )
        updated_brand = verify_response.json()
        assert updated_brand.get("description") == "Updated CRUD test brand"
        assert updated_brand.get("color") == "#654321"
        print(f"✓ UPDATE verified: Changes persisted")
        
        # DELETE
        delete_response = requests.delete(
            f"{BASE_URL}/api/admin/brands/{brand_id}",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert delete_response.status_code == 200
        print(f"✓ DELETE: Brand deleted")
        
        # Verify DELETE
        verify_delete = requests.get(
            f"{BASE_URL}/api/admin/brands/{brand_id}",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert verify_delete.status_code == 404
        print(f"✓ DELETE verified: Brand no longer exists")
        
        print(f"✓ Full CRUD flow completed successfully")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
