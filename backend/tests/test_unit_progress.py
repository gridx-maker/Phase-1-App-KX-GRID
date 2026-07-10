"""
Unit Progress Tracking Tests
Tests for student unit progress tracking across programs
- GET /api/student/progress - Get student's progress across all programs
- PUT /api/student/progress/{unit_id} - Student marks unit as in_progress
- PUT /api/admin/student/{student_id}/progress/{unit_id} - Admin marks unit as completed
"""

import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "admin@kotlerx.com"
ADMIN_PASSWORD = "admin123"
STUDENT_EMAIL = "regularstudent@kotlerx.com"
STUDENT_PASSWORD = "student123"


class TestAuthentication:
    """Test authentication for both admin and student"""
    
    def test_admin_login(self):
        """Admin login returns correct role"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert data["role"] == "admin"
        assert "token" in data
        print(f"✓ Admin login successful, role: {data['role']}")
    
    def test_student_login(self):
        """Student login returns correct role"""
        # Ensure student is registered first
        requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": STUDENT_EMAIL,
            "password": STUDENT_PASSWORD,
            "name": "Regular Student",
            "role": "student"
        })
        
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": STUDENT_EMAIL,
            "password": STUDENT_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert data["role"] == "student"
        assert "token" in data
        print(f"✓ Student login successful, role: {data['role']}")


class TestStudentProgressAPI:
    """Test student progress endpoints"""
    
    @pytest.fixture
    def student_token(self):
        """Get student auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": STUDENT_EMAIL,
            "password": STUDENT_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Student authentication failed")
    
    @pytest.fixture
    def admin_token(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Admin authentication failed")
    
    def test_get_student_progress(self, student_token):
        """GET /api/student/progress returns programs with units and progress status"""
        headers = {"Authorization": f"Bearer {student_token}"}
        response = requests.get(f"{BASE_URL}/api/student/progress", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        
        if len(data) > 0:
            program = data[0]
            # Verify program structure
            assert "program_id" in program
            assert "program_name" in program
            assert "total_units" in program
            assert "completed_units" in program
            assert "progress_percent" in program
            assert "units" in program
            
            # Verify progress_percent is calculated correctly
            if program["total_units"] > 0:
                expected_percent = round((program["completed_units"] / program["total_units"]) * 100)
                assert program["progress_percent"] == expected_percent
            
            # Verify unit structure if units exist
            if len(program["units"]) > 0:
                unit = program["units"][0]
                assert "unit_id" in unit
                assert "name" in unit
                assert "brand_name" in unit
                assert "duration_weeks" in unit
                assert "theory_hours" in unit
                assert "practical_hours" in unit
                assert "progress" in unit
                
                # Verify progress status is valid
                progress_status = unit["progress"].get("status", "not_started")
                assert progress_status in ["not_started", "in_progress", "completed"]
                
                print(f"✓ Unit '{unit['name']}' has status: {progress_status}")
        
        print(f"✓ GET /api/student/progress returned {len(data)} programs")
    
    def test_get_student_progress_unauthorized(self):
        """GET /api/student/progress without auth returns 401"""
        response = requests.get(f"{BASE_URL}/api/student/progress")
        assert response.status_code == 401
        print("✓ Unauthorized access correctly rejected")
    
    def test_student_mark_unit_in_progress(self, student_token, admin_token):
        """PUT /api/student/progress/{unit_id} allows students to mark units in_progress"""
        headers = {"Authorization": f"Bearer {student_token}"}
        admin_headers = {"Authorization": f"Bearer {admin_token}"}
        
        # First get programs to find a unit
        response = requests.get(f"{BASE_URL}/api/student/progress", headers=headers)
        assert response.status_code == 200
        programs = response.json()
        
        if len(programs) == 0:
            pytest.skip("No programs available for testing")
        
        # Find a unit to test with
        unit_id = None
        for program in programs:
            if len(program.get("units", [])) > 0:
                unit_id = program["units"][0]["unit_id"]
                break
        
        if not unit_id:
            pytest.skip("No units available for testing")
        
        # Student marks unit as in_progress
        response = requests.put(
            f"{BASE_URL}/api/student/progress/{unit_id}",
            json={"status": "in_progress"},
            headers=headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "in_progress"
        print(f"✓ Student marked unit {unit_id} as in_progress")
        
        # Verify the progress was saved
        response = requests.get(f"{BASE_URL}/api/student/progress", headers=headers)
        assert response.status_code == 200
        programs = response.json()
        
        # Find the unit and verify status
        found = False
        for program in programs:
            for unit in program.get("units", []):
                if unit["unit_id"] == unit_id:
                    assert unit["progress"]["status"] == "in_progress"
                    found = True
                    break
        
        assert found, "Unit not found in progress response"
        print("✓ Progress status verified in GET response")
    
    def test_student_cannot_mark_completed(self, student_token):
        """Students cannot mark units as completed (only admin/crew can)"""
        headers = {"Authorization": f"Bearer {student_token}"}
        
        # Get a unit to test with
        response = requests.get(f"{BASE_URL}/api/student/progress", headers=headers)
        programs = response.json()
        
        if len(programs) == 0 or len(programs[0].get("units", [])) == 0:
            pytest.skip("No units available for testing")
        
        unit_id = programs[0]["units"][0]["unit_id"]
        
        # Try to mark as completed (should fail)
        response = requests.put(
            f"{BASE_URL}/api/student/progress/{unit_id}",
            json={"status": "completed"},
            headers=headers
        )
        
        assert response.status_code == 403
        print("✓ Student correctly prevented from marking unit as completed")


class TestAdminProgressAPI:
    """Test admin progress update endpoints"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Admin authentication failed")
    
    @pytest.fixture
    def student_info(self, admin_token):
        """Get student info for testing"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/students", headers=headers)
        if response.status_code == 200:
            students = response.json()
            if len(students) > 0:
                return students[0]
        pytest.skip("No students available for testing")
    
    def test_admin_mark_unit_completed(self, admin_token, student_info):
        """PUT /api/admin/student/{student_id}/progress/{unit_id} allows admin to mark complete"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        student_id = student_info["student_id"]
        
        # Get programs to find a unit
        response = requests.get(f"{BASE_URL}/api/programs", headers=headers)
        assert response.status_code == 200
        programs = response.json()
        
        if len(programs) == 0:
            pytest.skip("No programs available")
        
        # Get units for first program
        program_id = programs[0]["program_id"]
        response = requests.get(f"{BASE_URL}/api/programs/{program_id}/units", headers=headers)
        
        if response.status_code != 200 or len(response.json()) == 0:
            pytest.skip("No units available for testing")
        
        unit_id = response.json()[0]["unit_id"]
        
        # Admin marks unit as completed
        response = requests.put(
            f"{BASE_URL}/api/admin/student/{student_id}/progress/{unit_id}",
            json={
                "status": "completed",
                "score": 85.5,
                "notes": "Test completion by admin"
            },
            headers=headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "completed"
        print(f"✓ Admin marked unit {unit_id} as completed for student {student_id}")
    
    def test_admin_update_with_score(self, admin_token, student_info):
        """Admin can update progress with score and notes"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        student_id = student_info["student_id"]
        
        # Get a unit
        response = requests.get(f"{BASE_URL}/api/programs", headers=headers)
        programs = response.json()
        
        if len(programs) == 0:
            pytest.skip("No programs available")
        
        program_id = programs[0]["program_id"]
        response = requests.get(f"{BASE_URL}/api/programs/{program_id}/units", headers=headers)
        
        if response.status_code != 200 or len(response.json()) == 0:
            pytest.skip("No units available")
        
        unit_id = response.json()[0]["unit_id"]
        
        # Update with score
        response = requests.put(
            f"{BASE_URL}/api/admin/student/{student_id}/progress/{unit_id}",
            json={
                "status": "completed",
                "score": 92.0,
                "notes": "Excellent performance"
            },
            headers=headers
        )
        
        assert response.status_code == 200
        print("✓ Admin updated progress with score and notes")
    
    def test_admin_update_invalid_student(self, admin_token):
        """Admin update with invalid student_id returns 404"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        response = requests.put(
            f"{BASE_URL}/api/admin/student/invalid_student_id/progress/some_unit_id",
            json={"status": "completed"},
            headers=headers
        )
        
        assert response.status_code == 404
        print("✓ Invalid student_id correctly returns 404")
    
    def test_admin_update_invalid_unit(self, admin_token, student_info):
        """Admin update with invalid unit_id returns 404"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        student_id = student_info["student_id"]
        
        response = requests.put(
            f"{BASE_URL}/api/admin/student/{student_id}/progress/invalid_unit_id",
            json={"status": "completed"},
            headers=headers
        )
        
        assert response.status_code == 404
        print("✓ Invalid unit_id correctly returns 404")


class TestProgramProgressOverview:
    """Test program progress overview endpoint for admin"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Admin authentication failed")
    
    def test_get_program_progress_overview(self, admin_token):
        """GET /api/admin/progress/program/{program_id} returns all students' progress"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Get programs
        response = requests.get(f"{BASE_URL}/api/programs", headers=headers)
        programs = response.json()
        
        if len(programs) == 0:
            pytest.skip("No programs available")
        
        program_id = programs[0]["program_id"]
        
        # Get progress overview
        response = requests.get(
            f"{BASE_URL}/api/admin/progress/program/{program_id}",
            headers=headers
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "program_id" in data
        assert "units" in data
        assert "students" in data
        
        print(f"✓ Program progress overview: {len(data['students'])} students, {len(data['units'])} units")


class TestUnitBuilder:
    """Test unit CRUD operations"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Admin authentication failed")
    
    @pytest.fixture
    def test_program(self, admin_token):
        """Get or create a test program"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/programs", headers=headers)
        programs = response.json()
        
        if len(programs) > 0:
            return programs[0]
        pytest.skip("No programs available for unit testing")
    
    @pytest.fixture
    def test_brand(self, admin_token):
        """Get a brand for unit assignment"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/brands", headers=headers)
        brands = response.json()
        
        if len(brands) > 0:
            return brands[0]
        pytest.skip("No brands available for unit testing")
    
    def test_create_unit(self, admin_token, test_program, test_brand):
        """Admin can create a unit with brand assignment"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        unit_data = {
            "program_id": test_program["program_id"],
            "name": f"TEST_Unit_{uuid.uuid4().hex[:6]}",
            "description": "Test unit for progress tracking",
            "brand_id": test_brand["brand_id"],
            "duration_weeks": 2,
            "order": 99,
            "theory_hours": 10,
            "practical_hours": 20,
            "assessments_required": []
        }
        
        response = requests.post(
            f"{BASE_URL}/api/programs/{test_program['program_id']}/units",
            json=unit_data,
            headers=headers
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "unit_id" in data
        assert data["name"] == unit_data["name"]
        assert data["brand_id"] == test_brand["brand_id"]
        assert data["theory_hours"] == 10
        assert data["practical_hours"] == 20
        
        print(f"✓ Created unit: {data['unit_id']}")
        
        # Cleanup - delete the test unit
        requests.delete(f"{BASE_URL}/api/units/{data['unit_id']}", headers=headers)
    
    def test_get_program_units(self, admin_token, test_program):
        """Get all units for a program"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        response = requests.get(
            f"{BASE_URL}/api/programs/{test_program['program_id']}/units",
            headers=headers
        )
        
        assert response.status_code == 200
        units = response.json()
        assert isinstance(units, list)
        
        if len(units) > 0:
            unit = units[0]
            assert "unit_id" in unit
            assert "name" in unit
            assert "brand_id" in unit
            assert "duration_weeks" in unit
        
        print(f"✓ Got {len(units)} units for program")


class TestMediaGallery:
    """Test media gallery endpoints"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Admin authentication failed")
    
    def test_get_public_media_landing(self):
        """Public media endpoint returns visible media for landing category"""
        response = requests.get(f"{BASE_URL}/api/media/gallery/landing")
        
        # Should return 200 even if empty
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Public landing media gallery: {len(data)} items")
    
    def test_get_public_media_student(self):
        """Public media filtered by student category"""
        response = requests.get(f"{BASE_URL}/api/media/gallery/student")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        
        print(f"✓ Student category media: {len(data)} items")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
