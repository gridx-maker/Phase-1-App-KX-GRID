"""
Test suite for KXGRID new features:
1. Program Batch Size field (no min restriction)
2. Program Highlights (4 editable fields)
3. Media Gallery (4 categories: landing, student, brand, crew)
4. Unit Builder (create/edit/delete units with brand assignment)
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestAuth:
    """Authentication tests"""
    
    @pytest.fixture(scope="class")
    def admin_token(self):
        """Get admin token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@kotlerx.com",
            "password": "admin123"
        })
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        return response.json()["token"]
    
    @pytest.fixture(scope="class")
    def admin_headers(self, admin_token):
        """Get admin headers"""
        return {"Authorization": f"Bearer {admin_token}"}
    
    def test_admin_login(self):
        """Test admin login works"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@kotlerx.com",
            "password": "admin123"
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert data["role"] == "admin"
        print(f"✓ Admin login successful, role: {data['role']}")


class TestProgramBatchSize:
    """Test Program Batch Size field accepts any value (no min restriction)"""
    
    @pytest.fixture(scope="class")
    def admin_headers(self):
        """Get admin headers"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@kotlerx.com",
            "password": "admin123"
        })
        return {"Authorization": f"Bearer {response.json()['token']}"}
    
    def test_create_program_with_batch_size_2(self, admin_headers):
        """Test creating program with batch_size=2 (was previously restricted to min=5)"""
        program_data = {
            "name": f"TEST_BatchSize2_{uuid.uuid4().hex[:6]}",
            "program_type": "certification",
            "description": "Test program with batch size 2",
            "duration_weeks": 4,
            "batch_size": 2,  # This was previously restricted
            "highlights": ["Test highlight 1", "Test highlight 2"]
        }
        response = requests.post(f"{BASE_URL}/api/programs", json=program_data, headers=admin_headers)
        assert response.status_code == 200, f"Failed to create program: {response.text}"
        data = response.json()
        assert data["batch_size"] == 2, f"Expected batch_size=2, got {data['batch_size']}"
        print(f"✓ Created program with batch_size=2: {data['program_id']}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/programs/{data['program_id']}", headers=admin_headers)
    
    def test_create_program_with_batch_size_08(self, admin_headers):
        """Test creating program with batch_size=8 (leading zero input)"""
        program_data = {
            "name": f"TEST_BatchSize08_{uuid.uuid4().hex[:6]}",
            "program_type": "diploma",
            "description": "Test program with batch size 08",
            "duration_weeks": 12,
            "batch_size": 8,  # Simulating "08" input
            "highlights": []
        }
        response = requests.post(f"{BASE_URL}/api/programs", json=program_data, headers=admin_headers)
        assert response.status_code == 200, f"Failed to create program: {response.text}"
        data = response.json()
        assert data["batch_size"] == 8
        print(f"✓ Created program with batch_size=8: {data['program_id']}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/programs/{data['program_id']}", headers=admin_headers)
    
    def test_update_program_batch_size_to_1(self, admin_headers):
        """Test updating program batch_size to 1"""
        # Create program first
        program_data = {
            "name": f"TEST_UpdateBatch_{uuid.uuid4().hex[:6]}",
            "program_type": "certification",
            "description": "Test program for batch update",
            "duration_weeks": 4,
            "batch_size": 20
        }
        create_response = requests.post(f"{BASE_URL}/api/programs", json=program_data, headers=admin_headers)
        assert create_response.status_code == 200
        program_id = create_response.json()["program_id"]
        
        # Update batch_size to 1
        update_response = requests.put(f"{BASE_URL}/api/programs/{program_id}", 
            json={"batch_size": 1}, headers=admin_headers)
        assert update_response.status_code == 200
        
        # Verify update
        get_response = requests.get(f"{BASE_URL}/api/programs/{program_id}")
        assert get_response.status_code == 200
        assert get_response.json()["batch_size"] == 1
        print(f"✓ Updated program batch_size to 1")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/programs/{program_id}", headers=admin_headers)


class TestProgramHighlights:
    """Test Program Highlights (4 editable fields)"""
    
    @pytest.fixture(scope="class")
    def admin_headers(self):
        """Get admin headers"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@kotlerx.com",
            "password": "admin123"
        })
        return {"Authorization": f"Bearer {response.json()['token']}"}
    
    def test_create_program_with_highlights(self, admin_headers):
        """Test creating program with 4 highlights"""
        highlights = [
            "Track Training & Safety",
            "Vehicle Handling Techniques",
            "Race Strategy & Tactics",
            "Industry Certification"
        ]
        program_data = {
            "name": f"TEST_Highlights_{uuid.uuid4().hex[:6]}",
            "program_type": "certification",
            "description": "Test program with highlights",
            "duration_weeks": 4,
            "batch_size": 20,
            "highlights": highlights
        }
        response = requests.post(f"{BASE_URL}/api/programs", json=program_data, headers=admin_headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert "highlights" in data
        assert len(data["highlights"]) == 4
        assert data["highlights"] == highlights
        print(f"✓ Created program with 4 highlights")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/programs/{data['program_id']}", headers=admin_headers)
    
    def test_update_program_highlights(self, admin_headers):
        """Test updating program highlights"""
        # Create program
        program_data = {
            "name": f"TEST_UpdateHighlights_{uuid.uuid4().hex[:6]}",
            "program_type": "diploma",
            "description": "Test program",
            "duration_weeks": 12,
            "batch_size": 15,
            "highlights": ["Original 1", "Original 2"]
        }
        create_response = requests.post(f"{BASE_URL}/api/programs", json=program_data, headers=admin_headers)
        assert create_response.status_code == 200
        program_id = create_response.json()["program_id"]
        
        # Update highlights
        new_highlights = ["Updated 1", "Updated 2", "Updated 3", "Updated 4"]
        update_response = requests.put(f"{BASE_URL}/api/programs/{program_id}",
            json={"highlights": new_highlights}, headers=admin_headers)
        assert update_response.status_code == 200
        
        # Verify update
        get_response = requests.get(f"{BASE_URL}/api/programs/{program_id}")
        assert get_response.status_code == 200
        assert get_response.json()["highlights"] == new_highlights
        print(f"✓ Updated program highlights successfully")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/programs/{program_id}", headers=admin_headers)
    
    def test_public_programs_show_highlights(self, admin_headers):
        """Test that public programs endpoint returns highlights"""
        # Create program with highlights
        highlights = ["Public Highlight 1", "Public Highlight 2"]
        program_data = {
            "name": f"TEST_PublicHighlights_{uuid.uuid4().hex[:6]}",
            "program_type": "certification",
            "description": "Test public highlights",
            "duration_weeks": 4,
            "batch_size": 20,
            "highlights": highlights
        }
        create_response = requests.post(f"{BASE_URL}/api/programs", json=program_data, headers=admin_headers)
        assert create_response.status_code == 200
        program_id = create_response.json()["program_id"]
        
        # Get public programs (no auth)
        public_response = requests.get(f"{BASE_URL}/api/programs")
        assert public_response.status_code == 200
        programs = public_response.json()
        
        # Find our test program
        test_program = next((p for p in programs if p["program_id"] == program_id), None)
        assert test_program is not None
        assert "highlights" in test_program
        assert test_program["highlights"] == highlights
        print(f"✓ Public programs endpoint returns highlights")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/programs/{program_id}", headers=admin_headers)


class TestMediaGallery:
    """Test Media Gallery with 4 categories"""
    
    @pytest.fixture(scope="class")
    def admin_headers(self):
        """Get admin headers"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@kotlerx.com",
            "password": "admin123"
        })
        return {"Authorization": f"Bearer {response.json()['token']}"}
    
    def test_add_media_landing_category(self, admin_headers):
        """Test adding media to landing category"""
        media_data = {
            "title": f"TEST_Landing_{uuid.uuid4().hex[:6]}",
            "description": "Test landing media",
            "media_type": "image",
            "url": "https://example.com/test-landing.jpg",
            "category": "landing",
            "is_visible": True,
            "order": 1
        }
        response = requests.post(f"{BASE_URL}/api/admin/media/gallery", json=media_data, headers=admin_headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert data["category"] == "landing"
        assert "media_id" in data
        print(f"✓ Added media to landing category: {data['media_id']}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/admin/media/gallery/{data['media_id']}", headers=admin_headers)
    
    def test_add_media_student_category(self, admin_headers):
        """Test adding media to student category"""
        media_data = {
            "title": f"TEST_Student_{uuid.uuid4().hex[:6]}",
            "description": "Test student media",
            "media_type": "image",
            "url": "https://example.com/test-student.jpg",
            "category": "student",
            "is_visible": True,
            "order": 1
        }
        response = requests.post(f"{BASE_URL}/api/admin/media/gallery", json=media_data, headers=admin_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["category"] == "student"
        print(f"✓ Added media to student category")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/admin/media/gallery/{data['media_id']}", headers=admin_headers)
    
    def test_add_media_brand_category(self, admin_headers):
        """Test adding media to brand category"""
        media_data = {
            "title": f"TEST_Brand_{uuid.uuid4().hex[:6]}",
            "description": "Test brand media",
            "media_type": "video",
            "url": "https://example.com/test-brand.mp4",
            "thumbnail_url": "https://example.com/test-brand-thumb.jpg",
            "category": "brand",
            "is_visible": True,
            "order": 1
        }
        response = requests.post(f"{BASE_URL}/api/admin/media/gallery", json=media_data, headers=admin_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["category"] == "brand"
        assert data["media_type"] == "video"
        print(f"✓ Added video media to brand category")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/admin/media/gallery/{data['media_id']}", headers=admin_headers)
    
    def test_add_media_crew_category(self, admin_headers):
        """Test adding media to crew category"""
        media_data = {
            "title": f"TEST_Crew_{uuid.uuid4().hex[:6]}",
            "description": "Test crew media",
            "media_type": "image",
            "url": "https://example.com/test-crew.jpg",
            "category": "crew",
            "is_visible": True,
            "order": 1
        }
        response = requests.post(f"{BASE_URL}/api/admin/media/gallery", json=media_data, headers=admin_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["category"] == "crew"
        print(f"✓ Added media to crew category")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/admin/media/gallery/{data['media_id']}", headers=admin_headers)
    
    def test_get_public_media_by_category(self, admin_headers):
        """Test public endpoint returns media by category"""
        # Add visible media
        media_data = {
            "title": f"TEST_Public_{uuid.uuid4().hex[:6]}",
            "description": "Test public media",
            "media_type": "image",
            "url": "https://example.com/test-public.jpg",
            "category": "landing",
            "is_visible": True,
            "order": 1
        }
        create_response = requests.post(f"{BASE_URL}/api/admin/media/gallery", json=media_data, headers=admin_headers)
        assert create_response.status_code == 200
        media_id = create_response.json()["media_id"]
        
        # Get public landing media (no auth)
        public_response = requests.get(f"{BASE_URL}/api/media/gallery/landing")
        assert public_response.status_code == 200
        media_list = public_response.json()
        assert isinstance(media_list, list)
        
        # Find our test media
        test_media = next((m for m in media_list if m["media_id"] == media_id), None)
        assert test_media is not None
        print(f"✓ Public media endpoint returns landing category media")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/admin/media/gallery/{media_id}", headers=admin_headers)
    
    def test_hidden_media_not_in_public(self, admin_headers):
        """Test hidden media is not returned in public endpoint"""
        # Add hidden media
        media_data = {
            "title": f"TEST_Hidden_{uuid.uuid4().hex[:6]}",
            "description": "Test hidden media",
            "media_type": "image",
            "url": "https://example.com/test-hidden.jpg",
            "category": "landing",
            "is_visible": False,  # Hidden
            "order": 1
        }
        create_response = requests.post(f"{BASE_URL}/api/admin/media/gallery", json=media_data, headers=admin_headers)
        assert create_response.status_code == 200
        media_id = create_response.json()["media_id"]
        
        # Get public landing media
        public_response = requests.get(f"{BASE_URL}/api/media/gallery/landing")
        assert public_response.status_code == 200
        media_list = public_response.json()
        
        # Verify hidden media is NOT in public list
        hidden_media = next((m for m in media_list if m["media_id"] == media_id), None)
        assert hidden_media is None, "Hidden media should not appear in public endpoint"
        print(f"✓ Hidden media not returned in public endpoint")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/admin/media/gallery/{media_id}", headers=admin_headers)
    
    def test_admin_get_all_media(self, admin_headers):
        """Test admin can get all media including hidden"""
        response = requests.get(f"{BASE_URL}/api/admin/media/gallery", headers=admin_headers)
        assert response.status_code == 200
        assert isinstance(response.json(), list)
        print(f"✓ Admin can get all media gallery items")
    
    def test_update_media_visibility(self, admin_headers):
        """Test updating media visibility"""
        # Create media
        media_data = {
            "title": f"TEST_Toggle_{uuid.uuid4().hex[:6]}",
            "description": "Test toggle visibility",
            "media_type": "image",
            "url": "https://example.com/test-toggle.jpg",
            "category": "landing",
            "is_visible": True,
            "order": 1
        }
        create_response = requests.post(f"{BASE_URL}/api/admin/media/gallery", json=media_data, headers=admin_headers)
        assert create_response.status_code == 200
        media_id = create_response.json()["media_id"]
        
        # Toggle visibility to false
        update_response = requests.put(f"{BASE_URL}/api/admin/media/gallery/{media_id}",
            json={"is_visible": False}, headers=admin_headers)
        assert update_response.status_code == 200
        print(f"✓ Updated media visibility")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/admin/media/gallery/{media_id}", headers=admin_headers)
    
    def test_delete_media(self, admin_headers):
        """Test deleting media"""
        # Create media
        media_data = {
            "title": f"TEST_Delete_{uuid.uuid4().hex[:6]}",
            "description": "Test delete",
            "media_type": "image",
            "url": "https://example.com/test-delete.jpg",
            "category": "landing",
            "is_visible": True,
            "order": 1
        }
        create_response = requests.post(f"{BASE_URL}/api/admin/media/gallery", json=media_data, headers=admin_headers)
        assert create_response.status_code == 200
        media_id = create_response.json()["media_id"]
        
        # Delete media
        delete_response = requests.delete(f"{BASE_URL}/api/admin/media/gallery/{media_id}", headers=admin_headers)
        assert delete_response.status_code == 200
        print(f"✓ Deleted media successfully")


class TestUnitBuilder:
    """Test Unit Builder for program units with brand assignment"""
    
    @pytest.fixture(scope="class")
    def admin_headers(self):
        """Get admin headers"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@kotlerx.com",
            "password": "admin123"
        })
        return {"Authorization": f"Bearer {response.json()['token']}"}
    
    @pytest.fixture(scope="class")
    def test_program(self, admin_headers):
        """Create a test program for unit tests"""
        program_data = {
            "name": f"TEST_UnitProgram_{uuid.uuid4().hex[:6]}",
            "program_type": "diploma",
            "description": "Test program for units",
            "duration_weeks": 12,
            "batch_size": 15
        }
        response = requests.post(f"{BASE_URL}/api/programs", json=program_data, headers=admin_headers)
        assert response.status_code == 200
        program = response.json()
        yield program
        # Cleanup
        requests.delete(f"{BASE_URL}/api/programs/{program['program_id']}", headers=admin_headers)
    
    @pytest.fixture(scope="class")
    def test_brand(self, admin_headers):
        """Get or create a test brand"""
        # Get existing brands
        response = requests.get(f"{BASE_URL}/api/admin/brands", headers=admin_headers)
        if response.status_code == 200 and len(response.json()) > 0:
            return response.json()[0]
        
        # Create a brand if none exist
        brand_data = {
            "name": f"TEST_Brand_{uuid.uuid4().hex[:6]}",
            "description": "Test brand for units",
            "color": "#00f0ff",
            "is_visible": True
        }
        create_response = requests.post(f"{BASE_URL}/api/admin/brands", json=brand_data, headers=admin_headers)
        assert create_response.status_code == 200
        return create_response.json()
    
    def test_create_unit(self, admin_headers, test_program, test_brand):
        """Test creating a unit for a program"""
        unit_data = {
            "program_id": test_program["program_id"],
            "name": f"TEST_Unit_{uuid.uuid4().hex[:6]}",
            "description": "Test unit description",
            "brand_id": test_brand["brand_id"],
            "duration_weeks": 2,
            "order": 1,
            "theory_hours": 10,
            "practical_hours": 20,
            "assessments_required": []
        }
        response = requests.post(f"{BASE_URL}/api/programs/{test_program['program_id']}/units",
            json=unit_data, headers=admin_headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert "unit_id" in data
        assert data["brand_id"] == test_brand["brand_id"]
        assert data["brand_name"] == test_brand["name"]
        print(f"✓ Created unit with brand assignment: {data['unit_id']}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/units/{data['unit_id']}", headers=admin_headers)
    
    def test_get_program_units(self, admin_headers, test_program, test_brand):
        """Test getting all units for a program"""
        # Create a unit first
        unit_data = {
            "program_id": test_program["program_id"],
            "name": f"TEST_GetUnit_{uuid.uuid4().hex[:6]}",
            "description": "Test unit",
            "brand_id": test_brand["brand_id"],
            "duration_weeks": 1,
            "order": 1
        }
        create_response = requests.post(f"{BASE_URL}/api/programs/{test_program['program_id']}/units",
            json=unit_data, headers=admin_headers)
        assert create_response.status_code == 200
        unit_id = create_response.json()["unit_id"]
        
        # Get units
        get_response = requests.get(f"{BASE_URL}/api/programs/{test_program['program_id']}/units")
        assert get_response.status_code == 200
        units = get_response.json()
        assert isinstance(units, list)
        assert len(units) >= 1
        print(f"✓ Got {len(units)} units for program")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/units/{unit_id}", headers=admin_headers)
    
    def test_update_unit(self, admin_headers, test_program, test_brand):
        """Test updating a unit"""
        # Create unit
        unit_data = {
            "program_id": test_program["program_id"],
            "name": f"TEST_UpdateUnit_{uuid.uuid4().hex[:6]}",
            "description": "Original description",
            "brand_id": test_brand["brand_id"],
            "duration_weeks": 1,
            "order": 1
        }
        create_response = requests.post(f"{BASE_URL}/api/programs/{test_program['program_id']}/units",
            json=unit_data, headers=admin_headers)
        assert create_response.status_code == 200
        unit_id = create_response.json()["unit_id"]
        
        # Update unit
        update_data = {
            "name": "Updated Unit Name",
            "description": "Updated description",
            "duration_weeks": 3
        }
        update_response = requests.put(f"{BASE_URL}/api/units/{unit_id}",
            json=update_data, headers=admin_headers)
        assert update_response.status_code == 200
        
        # Verify update
        get_response = requests.get(f"{BASE_URL}/api/units/{unit_id}")
        assert get_response.status_code == 200
        updated_unit = get_response.json()
        assert updated_unit["name"] == "Updated Unit Name"
        assert updated_unit["duration_weeks"] == 3
        print(f"✓ Updated unit successfully")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/units/{unit_id}", headers=admin_headers)
    
    def test_delete_unit(self, admin_headers, test_program, test_brand):
        """Test deleting a unit"""
        # Create unit
        unit_data = {
            "program_id": test_program["program_id"],
            "name": f"TEST_DeleteUnit_{uuid.uuid4().hex[:6]}",
            "description": "To be deleted",
            "brand_id": test_brand["brand_id"],
            "duration_weeks": 1,
            "order": 1
        }
        create_response = requests.post(f"{BASE_URL}/api/programs/{test_program['program_id']}/units",
            json=unit_data, headers=admin_headers)
        assert create_response.status_code == 200
        unit_id = create_response.json()["unit_id"]
        
        # Delete unit
        delete_response = requests.delete(f"{BASE_URL}/api/units/{unit_id}", headers=admin_headers)
        assert delete_response.status_code == 200
        
        # Verify deletion
        get_response = requests.get(f"{BASE_URL}/api/units/{unit_id}")
        assert get_response.status_code == 404
        print(f"✓ Deleted unit successfully")
    
    def test_unit_requires_valid_brand(self, admin_headers, test_program):
        """Test that unit creation requires a valid brand"""
        unit_data = {
            "program_id": test_program["program_id"],
            "name": f"TEST_InvalidBrand_{uuid.uuid4().hex[:6]}",
            "description": "Test invalid brand",
            "brand_id": "invalid_brand_id",
            "duration_weeks": 1,
            "order": 1
        }
        response = requests.post(f"{BASE_URL}/api/programs/{test_program['program_id']}/units",
            json=unit_data, headers=admin_headers)
        assert response.status_code == 404, "Should fail with invalid brand"
        print(f"✓ Unit creation correctly rejects invalid brand")


class TestAdminLoginRedirect:
    """Test admin login redirects to /admin not student registration"""
    
    def test_admin_login_returns_admin_role(self):
        """Test admin login returns admin role for redirect logic"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@kotlerx.com",
            "password": "admin123"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["role"] == "admin", f"Expected role=admin, got {data['role']}"
        print(f"✓ Admin login returns role=admin for proper redirect")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
