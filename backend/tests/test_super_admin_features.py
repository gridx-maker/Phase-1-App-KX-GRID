"""
Test Suite for Super Admin (KX ROOT) Features
Tests: Super Admin login, Admin CRUD, Partners CRUD, Programme Director, Contact Info, Callback Requests, Assessment Categories with Brand Assignment
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
SUPER_ADMIN_EMAIL = "root@kotlerx.com"
SUPER_ADMIN_PASSWORD = "KXRoot@2024"
ADMIN_EMAIL = "admin@kotlerx.com"
ADMIN_PASSWORD = "admin123"


class TestSuperAdminAuth:
    """Test Super Admin authentication"""
    
    def test_super_admin_login_success(self):
        """Test KX ROOT Super Admin can login"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": SUPER_ADMIN_EMAIL,
            "password": SUPER_ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Super Admin login failed: {response.text}"
        data = response.json()
        assert "token" in data
        assert data["role"] == "super_admin"
        assert data["email"] == SUPER_ADMIN_EMAIL
        print(f"✓ Super Admin login successful - role: {data['role']}")
    
    def test_super_admin_login_wrong_password(self):
        """Test Super Admin login fails with wrong password"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": SUPER_ADMIN_EMAIL,
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("✓ Super Admin login correctly rejected with wrong password")
    
    def test_regular_admin_login(self):
        """Test regular admin can still login"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert data["role"] == "admin"
        print(f"✓ Regular admin login successful - role: {data['role']}")


class TestSuperAdminDashboard:
    """Test Super Admin dashboard endpoint"""
    
    @pytest.fixture
    def super_admin_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": SUPER_ADMIN_EMAIL,
            "password": SUPER_ADMIN_PASSWORD
        })
        return response.json()["token"]
    
    @pytest.fixture
    def admin_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json()["token"]
    
    def test_super_admin_dashboard_access(self, super_admin_token):
        """Test Super Admin can access dashboard stats"""
        response = requests.get(
            f"{BASE_URL}/api/super-admin/dashboard",
            headers={"Authorization": f"Bearer {super_admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "admins" in data
        assert "students" in data
        assert "programs" in data
        assert "brands" in data
        assert "total_leads" in data
        assert "pending_callbacks" in data
        print(f"✓ Super Admin dashboard stats: {data}")
    
    def test_regular_admin_cannot_access_super_dashboard(self, admin_token):
        """Test regular admin cannot access super admin dashboard"""
        response = requests.get(
            f"{BASE_URL}/api/super-admin/dashboard",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 403
        print("✓ Regular admin correctly denied access to super admin dashboard")


class TestAdminManagement:
    """Test Super Admin can create/delete admin accounts"""
    
    @pytest.fixture
    def super_admin_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": SUPER_ADMIN_EMAIL,
            "password": SUPER_ADMIN_PASSWORD
        })
        return response.json()["token"]
    
    @pytest.fixture
    def admin_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json()["token"]
    
    def test_create_admin_account(self, super_admin_token):
        """Test Super Admin can create new admin account"""
        test_email = f"test_admin_{uuid.uuid4().hex[:8]}@kotlerx.com"
        response = requests.post(
            f"{BASE_URL}/api/super-admin/create-admin",
            json={
                "email": test_email,
                "password": "TestAdmin123",
                "name": "Test Admin"
            },
            headers={"Authorization": f"Bearer {super_admin_token}"}
        )
        assert response.status_code == 200, f"Create admin failed: {response.text}"
        data = response.json()
        assert "user_id" in data
        print(f"✓ Admin account created: {test_email}")
        
        # Verify the new admin can login
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": test_email,
            "password": "TestAdmin123"
        })
        assert login_response.status_code == 200
        assert login_response.json()["role"] == "admin"
        print(f"✓ New admin can login successfully")
        
        # Cleanup - delete the test admin
        user_id = data["user_id"]
        delete_response = requests.delete(
            f"{BASE_URL}/api/super-admin/admins/{user_id}",
            headers={"Authorization": f"Bearer {super_admin_token}"}
        )
        assert delete_response.status_code == 200
        print(f"✓ Test admin deleted")
    
    def test_get_all_admins(self, super_admin_token):
        """Test Super Admin can list all admin accounts"""
        response = requests.get(
            f"{BASE_URL}/api/super-admin/admins",
            headers={"Authorization": f"Bearer {super_admin_token}"}
        )
        assert response.status_code == 200
        admins = response.json()
        assert isinstance(admins, list)
        print(f"✓ Found {len(admins)} admin accounts")
    
    def test_regular_admin_cannot_create_admin(self, admin_token):
        """Test regular admin cannot create admin accounts"""
        response = requests.post(
            f"{BASE_URL}/api/super-admin/create-admin",
            json={
                "email": "unauthorized@test.com",
                "password": "test123",
                "name": "Unauthorized"
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 403
        print("✓ Regular admin correctly denied from creating admin accounts")


class TestPartnersCRUD:
    """Test Partners/Sponsors CRUD operations"""
    
    @pytest.fixture
    def super_admin_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": SUPER_ADMIN_EMAIL,
            "password": SUPER_ADMIN_PASSWORD
        })
        return response.json()["token"]
    
    def test_create_partner(self, super_admin_token):
        """Test creating a new partner"""
        partner_name = f"TEST_Partner_{uuid.uuid4().hex[:6]}"
        response = requests.post(
            f"{BASE_URL}/api/admin/partners",
            json={
                "name": partner_name,
                "partner_type": "sponsor",
                "website_url": "https://test-partner.com",
                "is_visible": True,
                "order": 1
            },
            headers={"Authorization": f"Bearer {super_admin_token}"}
        )
        assert response.status_code == 200, f"Create partner failed: {response.text}"
        data = response.json()
        assert "partner_id" in data
        assert data["name"] == partner_name
        print(f"✓ Partner created: {partner_name}")
        
        # Cleanup
        partner_id = data["partner_id"]
        delete_response = requests.delete(
            f"{BASE_URL}/api/admin/partners/{partner_id}",
            headers={"Authorization": f"Bearer {super_admin_token}"}
        )
        assert delete_response.status_code == 200
        print(f"✓ Test partner deleted")
    
    def test_get_all_partners_admin(self, super_admin_token):
        """Test admin can get all partners including hidden"""
        response = requests.get(
            f"{BASE_URL}/api/admin/partners",
            headers={"Authorization": f"Bearer {super_admin_token}"}
        )
        assert response.status_code == 200
        partners = response.json()
        assert isinstance(partners, list)
        print(f"✓ Admin can see {len(partners)} partners")
    
    def test_get_public_partners(self):
        """Test public endpoint returns only visible partners"""
        response = requests.get(f"{BASE_URL}/api/partners")
        assert response.status_code == 200
        partners = response.json()
        assert isinstance(partners, list)
        # All returned partners should be visible
        for p in partners:
            assert p.get("is_visible", True) == True
        print(f"✓ Public partners endpoint returns {len(partners)} visible partners")
    
    def test_update_partner(self, super_admin_token):
        """Test updating a partner"""
        # Create a partner first
        partner_name = f"TEST_Update_{uuid.uuid4().hex[:6]}"
        create_response = requests.post(
            f"{BASE_URL}/api/admin/partners",
            json={"name": partner_name, "partner_type": "partner", "is_visible": True},
            headers={"Authorization": f"Bearer {super_admin_token}"}
        )
        partner_id = create_response.json()["partner_id"]
        
        # Update it
        update_response = requests.put(
            f"{BASE_URL}/api/admin/partners/{partner_id}",
            json={"name": f"{partner_name}_UPDATED", "partner_type": "association"},
            headers={"Authorization": f"Bearer {super_admin_token}"}
        )
        assert update_response.status_code == 200
        print(f"✓ Partner updated successfully")
        
        # Cleanup
        requests.delete(
            f"{BASE_URL}/api/admin/partners/{partner_id}",
            headers={"Authorization": f"Bearer {super_admin_token}"}
        )


class TestProgrammeDirector:
    """Test Programme Director CMS endpoints"""
    
    @pytest.fixture
    def super_admin_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": SUPER_ADMIN_EMAIL,
            "password": SUPER_ADMIN_PASSWORD
        })
        return response.json()["token"]
    
    def test_get_programme_director_public(self):
        """Test public can get programme director info"""
        response = requests.get(f"{BASE_URL}/api/cms/programme-director")
        assert response.status_code == 200
        data = response.json()
        assert "name" in data
        assert "designation" in data
        assert "message" in data
        print(f"✓ Programme Director: {data.get('name')} - {data.get('designation')}")
    
    def test_update_programme_director(self, super_admin_token):
        """Test Super Admin can update programme director"""
        response = requests.put(
            f"{BASE_URL}/api/cms/programme-director",
            json={
                "name": "Dr. Test Director",
                "designation": "Test Director of Programmes",
                "message": "Test welcome message for KXGRID testing."
            },
            headers={"Authorization": f"Bearer {super_admin_token}"}
        )
        assert response.status_code == 200
        print("✓ Programme Director updated successfully")
        
        # Verify update
        get_response = requests.get(f"{BASE_URL}/api/cms/programme-director")
        data = get_response.json()
        assert data["name"] == "Dr. Test Director"
        print("✓ Programme Director update verified")


class TestContactInfo:
    """Test Contact Info CMS endpoints"""
    
    @pytest.fixture
    def super_admin_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": SUPER_ADMIN_EMAIL,
            "password": SUPER_ADMIN_PASSWORD
        })
        return response.json()["token"]
    
    def test_get_contact_info_public(self):
        """Test public can get contact info"""
        response = requests.get(f"{BASE_URL}/api/cms/contact-info")
        assert response.status_code == 200
        data = response.json()
        assert "email" in data
        assert "phone" in data
        assert "whatsapp_number" in data
        print(f"✓ Contact Info: {data.get('email')}, {data.get('phone')}")
    
    def test_update_contact_info(self, super_admin_token):
        """Test Super Admin can update contact info"""
        response = requests.put(
            f"{BASE_URL}/api/cms/contact-info",
            json={
                "email": "test@kotlerx.com",
                "phone": "+91 12345 67890",
                "whatsapp_number": "+911234567890",
                "location_address": "Test Location, India",
                "heading_text": "Test Heading",
                "subheading_text": "Test Subheading"
            },
            headers={"Authorization": f"Bearer {super_admin_token}"}
        )
        assert response.status_code == 200
        print("✓ Contact Info updated successfully")


class TestCallbackRequests:
    """Test Callback Request (Lead) endpoints"""
    
    @pytest.fixture
    def super_admin_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": SUPER_ADMIN_EMAIL,
            "password": SUPER_ADMIN_PASSWORD
        })
        return response.json()["token"]
    
    def test_create_callback_request_public(self):
        """Test public can submit callback request (creates lead)"""
        response = requests.post(
            f"{BASE_URL}/api/callback-request",
            json={
                "name": "Test User",
                "phone": "+91 98765 43210",
                "email": "testuser@example.com",
                "message": "I want to know more about programs"
            }
        )
        assert response.status_code == 200, f"Callback request failed: {response.text}"
        data = response.json()
        assert "request_id" in data
        print(f"✓ Callback request created: {data['request_id']}")
    
    def test_get_callback_requests_admin(self, super_admin_token):
        """Test admin can get all callback requests"""
        response = requests.get(
            f"{BASE_URL}/api/admin/callback-requests",
            headers={"Authorization": f"Bearer {super_admin_token}"}
        )
        assert response.status_code == 200
        requests_list = response.json()
        assert isinstance(requests_list, list)
        print(f"✓ Found {len(requests_list)} callback requests")
    
    def test_callback_creates_lead(self, super_admin_token):
        """Test callback request also creates a lead entry"""
        # Create callback
        callback_response = requests.post(
            f"{BASE_URL}/api/callback-request",
            json={
                "name": "Lead Test User",
                "phone": "+91 11111 22222",
                "email": "leadtest@example.com",
                "message": "Testing lead creation"
            }
        )
        assert callback_response.status_code == 200
        
        # Check leads
        leads_response = requests.get(
            f"{BASE_URL}/api/admin/leads",
            headers={"Authorization": f"Bearer {super_admin_token}"}
        )
        assert leads_response.status_code == 200
        leads = leads_response.json()
        
        # Find our lead
        found = any(l.get("mobile") == "+91 11111 22222" for l in leads)
        assert found, "Lead was not created from callback request"
        print("✓ Callback request correctly created a lead entry")


class TestAssessmentCategoriesWithBrands:
    """Test Assessment Categories with Brand Assignment"""
    
    @pytest.fixture
    def super_admin_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": SUPER_ADMIN_EMAIL,
            "password": SUPER_ADMIN_PASSWORD
        })
        return response.json()["token"]
    
    def test_get_assessment_categories(self, super_admin_token):
        """Test getting assessment categories with brand info"""
        response = requests.get(
            f"{BASE_URL}/api/admin/assessment-categories",
            headers={"Authorization": f"Bearer {super_admin_token}"}
        )
        assert response.status_code == 200
        categories = response.json()
        assert isinstance(categories, list)
        assert len(categories) > 0, "Should have default categories"
        
        # Check structure
        for cat in categories:
            assert "category_id" in cat
            assert "name" in cat
            assert "brand_ids" in cat or cat.get("brand_ids") is None
        print(f"✓ Found {len(categories)} assessment categories")
    
    def test_update_category_with_brand_assignment(self, super_admin_token):
        """Test updating category with brand assignment"""
        # Get categories
        cat_response = requests.get(
            f"{BASE_URL}/api/admin/assessment-categories",
            headers={"Authorization": f"Bearer {super_admin_token}"}
        )
        categories = cat_response.json()
        
        if len(categories) == 0:
            pytest.skip("No categories to test")
        
        category = categories[0]
        category_id = category["category_id"]
        
        # Get brands
        brands_response = requests.get(
            f"{BASE_URL}/api/admin/brands",
            headers={"Authorization": f"Bearer {super_admin_token}"}
        )
        brands = brands_response.json()
        
        if len(brands) == 0:
            pytest.skip("No brands to assign")
        
        # Update category with brand assignment
        brand_ids = [brands[0]["brand_id"]] if brands else []
        update_response = requests.put(
            f"{BASE_URL}/api/admin/assessment-categories/{category_id}",
            json={
                "name": category["name"],
                "description": category.get("description", ""),
                "scale_min": category.get("scale_min", 1),
                "scale_max": category.get("scale_max", 5),
                "is_active": True,
                "brand_ids": brand_ids
            },
            headers={"Authorization": f"Bearer {super_admin_token}"}
        )
        assert update_response.status_code == 200
        print(f"✓ Category updated with brand assignment: {brand_ids}")
        
        # Verify update
        verify_response = requests.get(
            f"{BASE_URL}/api/admin/assessment-categories",
            headers={"Authorization": f"Bearer {super_admin_token}"}
        )
        updated_categories = verify_response.json()
        updated_cat = next((c for c in updated_categories if c["category_id"] == category_id), None)
        assert updated_cat is not None
        assert updated_cat.get("brand_ids") == brand_ids or (not brand_ids and not updated_cat.get("brand_ids"))
        print("✓ Brand assignment verified")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
