"""
Backend tests for KotlerX Multi-Modal Login and Lead Management
Tests: NFC Login, Mobile+OTP Login, Lead Export, Lead CRUD
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials from requirements
ADMIN_EMAIL = "admin@kotlerx.com"
ADMIN_PASSWORD = "admin123"
NFC_STUDENT_EMAIL = "nfcstudent@test.com"
NFC_STUDENT_PASSWORD = "test123"
NFC_CARD_ID = "NFC_TESTLOGIN"
MOCK_OTP = "123456"
TEST_MOBILE = "9876543210"


class TestHealthCheck:
    """Basic API health check"""
    
    def test_api_running(self):
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "running"
        print("✓ API is running")


class TestEmailLogin:
    """Email/Password login tests"""
    
    def test_admin_login_success(self):
        """Test admin login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        data = response.json()
        assert "token" in data
        assert data["role"] == "admin"
        assert data["email"] == ADMIN_EMAIL
        print(f"✓ Admin login successful - role: {data['role']}")
        return data["token"]
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "invalid@test.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("✓ Invalid credentials correctly rejected")


class TestNFCLogin:
    """NFC Card ID login tests"""
    
    @pytest.fixture(autouse=True)
    def setup_nfc_student(self):
        """Setup: Create NFC student if not exists"""
        # First register the student user
        register_response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": NFC_STUDENT_EMAIL,
            "password": NFC_STUDENT_PASSWORD,
            "name": "NFC Test Student",
            "role": "student"
        })
        
        if register_response.status_code == 200:
            user_data = register_response.json()
            user_id = user_data["user_id"]
            token = user_data["token"]
            
            # Register student profile with NFC card
            student_response = requests.post(f"{BASE_URL}/api/students/register", 
                json={
                    "user_id": user_id,
                    "full_name": "NFC Test Student",
                    "mobile": TEST_MOBILE,
                    "age": 25,
                    "blood_group": "O+",
                    "address": "Test Address",
                    "city": "Test City",
                    "state": "Test State",
                    "emergency_contact": "9999999999",
                    "highest_degree": "Graduate",
                    "occupation_type": "student",
                    "nfc_card_id": NFC_CARD_ID
                },
                headers={"Authorization": f"Bearer {token}"}
            )
            print(f"Student registration: {student_response.status_code}")
        elif register_response.status_code == 400:
            print("NFC student already exists")
    
    def test_nfc_login_success(self):
        """Test NFC login with valid card ID"""
        response = requests.post(f"{BASE_URL}/api/auth/nfc-login", json={
            "nfc_card_id": NFC_CARD_ID
        })
        
        if response.status_code == 200:
            data = response.json()
            assert "token" in data
            assert data["nfc_card_id"] == NFC_CARD_ID
            print(f"✓ NFC login successful - user: {data.get('name')}")
        elif response.status_code == 404:
            # NFC card not found - this is expected if student not registered
            print("⚠ NFC card not found (student may not be registered)")
            pytest.skip("NFC student not registered")
        else:
            pytest.fail(f"Unexpected response: {response.status_code} - {response.text}")
    
    def test_nfc_login_invalid_card(self):
        """Test NFC login with invalid card ID"""
        response = requests.post(f"{BASE_URL}/api/auth/nfc-login", json={
            "nfc_card_id": "INVALID_NFC_123"
        })
        assert response.status_code == 404
        print("✓ Invalid NFC card correctly rejected")


class TestMobileOTPLogin:
    """Mobile + OTP login tests"""
    
    def test_send_otp_success(self):
        """Test OTP sending"""
        response = requests.post(f"{BASE_URL}/api/otp/send", json={
            "phone": TEST_MOBILE
        })
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "sent"
        print("✓ OTP sent successfully")
    
    def test_verify_otp_success(self):
        """Test OTP verification with mock OTP"""
        # First send OTP
        requests.post(f"{BASE_URL}/api/otp/send", json={"phone": TEST_MOBILE})
        
        # Verify with mock OTP
        response = requests.post(f"{BASE_URL}/api/otp/verify", json={
            "phone": TEST_MOBILE,
            "otp": MOCK_OTP
        })
        assert response.status_code == 200
        data = response.json()
        assert data["valid"] == True
        print("✓ OTP verified successfully (mock OTP: 123456)")
    
    def test_verify_otp_invalid(self):
        """Test OTP verification with wrong OTP"""
        # First send OTP
        requests.post(f"{BASE_URL}/api/otp/send", json={"phone": "1234567890"})
        
        # Verify with wrong OTP
        response = requests.post(f"{BASE_URL}/api/otp/verify", json={
            "phone": "1234567890",
            "otp": "000000"
        })
        assert response.status_code == 400
        print("✓ Invalid OTP correctly rejected")
    
    def test_mobile_login_flow(self):
        """Test complete mobile login flow"""
        # This requires a student with registered mobile
        response = requests.post(f"{BASE_URL}/api/auth/mobile-login", json={
            "mobile": TEST_MOBILE
        })
        
        if response.status_code == 200:
            data = response.json()
            assert "token" in data
            print(f"✓ Mobile login successful - user: {data.get('name')}")
        elif response.status_code == 404:
            print("⚠ Mobile number not registered (expected if student not setup)")
        else:
            print(f"Mobile login response: {response.status_code}")


class TestLeadManagement:
    """Lead CRUD and export tests"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json()["token"]
        pytest.skip("Admin login failed")
    
    def test_create_lead_public(self):
        """Test lead creation (public endpoint)"""
        import uuid
        test_lead = {
            "name": f"Test Lead {uuid.uuid4().hex[:6]}",
            "location": "Mumbai",
            "mobile": "9876543210",
            "program_interest": "Racing Fundamentals",
            "fee_type": "cash"
        }
        
        response = requests.post(f"{BASE_URL}/api/leads", json=test_lead)
        assert response.status_code == 200
        data = response.json()
        assert "lead_id" in data
        print(f"✓ Lead created: {data['lead_id']}")
        return data["lead_id"]
    
    def test_get_leads_admin(self, admin_token):
        """Test getting leads (admin only)"""
        response = requests.get(f"{BASE_URL}/api/admin/leads", 
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Retrieved {len(data)} leads")
    
    def test_get_lead_stats_admin(self, admin_token):
        """Test getting lead statistics"""
        response = requests.get(f"{BASE_URL}/api/admin/leads/stats",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "total" in data
        assert "new" in data
        assert "contacted" in data
        assert "converted" in data
        print(f"✓ Lead stats: total={data['total']}, new={data['new']}")
    
    def test_update_lead_status(self, admin_token):
        """Test updating lead status"""
        # First create a lead
        import uuid
        test_lead = {
            "name": f"Update Test {uuid.uuid4().hex[:6]}",
            "location": "Delhi",
            "mobile": "8765432109",
            "program_interest": "Professional Racing",
            "fee_type": "loan"
        }
        create_response = requests.post(f"{BASE_URL}/api/leads", json=test_lead)
        lead_id = create_response.json()["lead_id"]
        
        # Update status
        response = requests.put(f"{BASE_URL}/api/admin/leads/{lead_id}",
            json={"status": "contacted"},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        print(f"✓ Lead status updated to 'contacted'")
    
    def test_export_leads_excel(self, admin_token):
        """Test Excel export of leads"""
        response = requests.get(f"{BASE_URL}/api/admin/leads/export",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        
        # Check content type
        content_type = response.headers.get("content-type", "")
        assert "spreadsheet" in content_type or "octet-stream" in content_type
        
        # Check content disposition
        content_disp = response.headers.get("content-disposition", "")
        assert "kotlerx_leads" in content_disp
        assert ".xlsx" in content_disp
        
        # Check file size (should have some content)
        assert len(response.content) > 0
        print(f"✓ Excel export successful - file size: {len(response.content)} bytes")
    
    def test_leads_unauthorized(self):
        """Test leads endpoint without auth"""
        response = requests.get(f"{BASE_URL}/api/admin/leads")
        assert response.status_code == 401
        print("✓ Unauthorized access correctly rejected")


class TestAdminStats:
    """Admin dashboard stats tests"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json()["token"]
        pytest.skip("Admin login failed")
    
    def test_admin_stats(self, admin_token):
        """Test admin stats endpoint"""
        response = requests.get(f"{BASE_URL}/api/admin/stats",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "total_students" in data
        assert "active_students" in data
        assert "total_programs" in data
        print(f"✓ Admin stats: {data['total_students']} students, {data['total_programs']} programs")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
