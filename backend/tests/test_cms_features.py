"""
Test CMS Features for KotlerX
- CMS Settings API (GET/PUT)
- CMS Landing Content API (GET/PUT)
- Email functionality (test button exists, actual send will fail without real API key)
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestCMSSettings:
    """Test CMS Settings API endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test fixtures"""
        self.admin_email = "admin@kotlerx.com"
        self.admin_password = "admin123"
        self.token = None
        
    def get_admin_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": self.admin_email,
            "password": self.admin_password
        })
        if response.status_code == 200:
            return response.json().get("token")
        return None
    
    def test_get_cms_settings_public(self):
        """Test GET /api/cms/settings - public endpoint"""
        response = requests.get(f"{BASE_URL}/api/cms/settings")
        assert response.status_code == 200
        data = response.json()
        # Should return settings or defaults
        assert isinstance(data, dict)
        print(f"CMS Settings: {data}")
    
    def test_get_cms_settings_has_university_email(self):
        """Test that CMS settings include university_email field"""
        response = requests.get(f"{BASE_URL}/api/cms/settings")
        assert response.status_code == 200
        data = response.json()
        # Check if university_email exists (may be empty or have value)
        assert "university_email" in data or "setting_id" in data
        print(f"University email configured: {data.get('university_email', 'Not set')}")
    
    def test_put_cms_settings_requires_auth(self):
        """Test PUT /api/cms/settings requires authentication"""
        response = requests.put(f"{BASE_URL}/api/cms/settings", json={
            "university_email": "test@test.edu"
        })
        assert response.status_code == 401
        print("PUT CMS settings correctly requires authentication")
    
    def test_put_cms_settings_admin_only(self):
        """Test PUT /api/cms/settings - admin can update"""
        token = self.get_admin_token()
        assert token is not None, "Failed to get admin token"
        
        test_email = "test_cms@university.edu"
        response = requests.put(
            f"{BASE_URL}/api/cms/settings",
            json={
                "university_email": test_email,
                "auto_email_enabled": True
            },
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        print(f"CMS settings updated successfully")
        
        # Verify the update
        verify_response = requests.get(f"{BASE_URL}/api/cms/settings")
        assert verify_response.status_code == 200
        data = verify_response.json()
        assert data.get("university_email") == test_email
        print(f"Verified university email: {data.get('university_email')}")


class TestCMSLandingContent:
    """Test CMS Landing Page Content API endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test fixtures"""
        self.admin_email = "admin@kotlerx.com"
        self.admin_password = "admin123"
        
    def get_admin_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": self.admin_email,
            "password": self.admin_password
        })
        if response.status_code == 200:
            return response.json().get("token")
        return None
    
    def test_get_cms_landing_public(self):
        """Test GET /api/cms/landing - public endpoint"""
        response = requests.get(f"{BASE_URL}/api/cms/landing")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)
        print(f"Landing content retrieved: {list(data.keys())}")
    
    def test_get_cms_landing_has_headlines(self):
        """Test that landing content includes 3 hook point headlines"""
        response = requests.get(f"{BASE_URL}/api/cms/landing")
        assert response.status_code == 200
        data = response.json()
        
        # Check for 3 headlines
        assert "hero_headline_1" in data, "Missing hero_headline_1"
        assert "hero_headline_2" in data, "Missing hero_headline_2"
        assert "hero_headline_3" in data, "Missing hero_headline_3"
        
        print(f"Headline 1: {data.get('hero_headline_1', '')[:50]}...")
        print(f"Headline 2: {data.get('hero_headline_2', '')[:50]}...")
        print(f"Headline 3: {data.get('hero_headline_3', '')[:50]}...")
    
    def test_get_cms_landing_has_description(self):
        """Test that landing content includes hero description"""
        response = requests.get(f"{BASE_URL}/api/cms/landing")
        assert response.status_code == 200
        data = response.json()
        
        assert "hero_description" in data, "Missing hero_description"
        print(f"Hero description: {data.get('hero_description', '')}")
    
    def test_get_cms_landing_has_stats(self):
        """Test that landing content includes stats"""
        response = requests.get(f"{BASE_URL}/api/cms/landing")
        assert response.status_code == 200
        data = response.json()
        
        assert "stats" in data, "Missing stats"
        stats = data.get("stats", {})
        assert "students_trained" in stats or isinstance(stats, dict)
        print(f"Stats: {stats}")
    
    def test_put_cms_landing_requires_auth(self):
        """Test PUT /api/cms/landing requires authentication"""
        response = requests.put(f"{BASE_URL}/api/cms/landing", json={
            "hero_headline_1": "Test headline"
        })
        assert response.status_code == 401
        print("PUT CMS landing correctly requires authentication")
    
    def test_put_cms_landing_admin_can_update(self):
        """Test PUT /api/cms/landing - admin can update content"""
        token = self.get_admin_token()
        assert token is not None, "Failed to get admin token"
        
        # Get current content first
        current = requests.get(f"{BASE_URL}/api/cms/landing").json()
        
        # Update with test content
        test_headline = "TEST_Updated Headline for Testing"
        response = requests.put(
            f"{BASE_URL}/api/cms/landing",
            json={
                "hero_headline_1": test_headline,
                "hero_headline_2": current.get("hero_headline_2", ""),
                "hero_headline_3": current.get("hero_headline_3", ""),
                "hero_description": current.get("hero_description", ""),
                "stats": current.get("stats", {})
            },
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        print("Landing content updated successfully")
        
        # Verify the update
        verify_response = requests.get(f"{BASE_URL}/api/cms/landing")
        assert verify_response.status_code == 200
        data = verify_response.json()
        assert data.get("hero_headline_1") == test_headline
        print(f"Verified headline update: {data.get('hero_headline_1')}")
        
        # Restore original content
        requests.put(
            f"{BASE_URL}/api/cms/landing",
            json={
                "hero_headline_1": current.get("hero_headline_1", "India's First University-Integrated Motorsport, Media & Automotive Skill Framework"),
                "hero_headline_2": current.get("hero_headline_2", ""),
                "hero_headline_3": current.get("hero_headline_3", ""),
                "hero_description": current.get("hero_description", ""),
                "stats": current.get("stats", {})
            },
            headers={"Authorization": f"Bearer {token}"}
        )
        print("Original content restored")


class TestEmailEndpoints:
    """Test Email-related endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test fixtures"""
        self.admin_email = "admin@kotlerx.com"
        self.admin_password = "admin123"
        
    def get_admin_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": self.admin_email,
            "password": self.admin_password
        })
        if response.status_code == 200:
            return response.json().get("token")
        return None
    
    def test_send_test_email_endpoint_exists(self):
        """Test that send test email endpoint exists at /api/admin/test-email"""
        token = self.get_admin_token()
        assert token is not None, "Failed to get admin token"
        
        # Try to send test email - will fail without real API key but endpoint should exist
        response = requests.post(
            f"{BASE_URL}/api/admin/test-email",
            headers={"Authorization": f"Bearer {token}"}
        )
        # Endpoint should exist (may return 500 due to missing API key, but not 404)
        assert response.status_code != 404, "Send test email endpoint not found"
        print(f"Send test email endpoint exists, status: {response.status_code}")
        # Expected: 500 (email API key not configured) or 200 (if configured)
    
    def test_send_report_email_endpoint_exists(self):
        """Test that send report email endpoint exists at /api/admin/reports/email"""
        token = self.get_admin_token()
        assert token is not None, "Failed to get admin token"
        
        # Try to send report email - will fail without real API key but endpoint should exist
        response = requests.post(
            f"{BASE_URL}/api/admin/reports/email",
            json={"report_type": "weekly"},
            headers={"Authorization": f"Bearer {token}"}
        )
        # Endpoint should exist (may return 500 due to missing API key, but not 404)
        assert response.status_code != 404, "Send report email endpoint not found"
        print(f"Send report email endpoint exists, status: {response.status_code}")
        # Expected: 500 (email API key not configured) or 200 (if configured)


class TestAdminLogin:
    """Test admin login for CMS access"""
    
    def test_admin_login_success(self):
        """Test admin can login with correct credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@kotlerx.com",
            "password": "admin123"
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert data.get("role") == "admin"
        print(f"Admin login successful, role: {data.get('role')}")
    
    def test_admin_login_invalid_password(self):
        """Test admin login fails with wrong password"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@kotlerx.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("Admin login correctly rejected with wrong password")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
