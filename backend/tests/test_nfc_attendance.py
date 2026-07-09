"""
Test NFC Attendance Session and Assessment Features
- NFC Attendance Session Start/End
- NFC Attendance Recording (student tap)
- Assessment Categories CRUD
- Assessment Submission with NFC Confirmation
"""

import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "admin@kotlerx.com"
ADMIN_PASSWORD = "admin123"
TEST_NFC_IDS = ["NFC_TESTLOGIN", "NFC_DEMO001", "NFC_06EF706D"]


class TestNFCAttendanceFeatures:
    """Test NFC Attendance Session and Assessment Features"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test fixtures"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        self.admin_token = None
        self.test_session_id = None
        self.test_unit_id = None
        self.test_category_id = None
        self.test_student_id = None
        
    def get_admin_token(self):
        """Get admin authentication token"""
        if self.admin_token:
            return self.admin_token
            
        response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        data = response.json()
        self.admin_token = data.get("token")
        return self.admin_token
    
    def get_auth_headers(self):
        """Get headers with auth token"""
        token = self.get_admin_token()
        return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    
    # ==================== ASSESSMENT CATEGORIES TESTS ====================
    
    def test_01_get_assessment_categories(self):
        """Test getting assessment categories (auto-seeds if empty)"""
        headers = self.get_auth_headers()
        response = self.session.get(f"{BASE_URL}/api/admin/assessment-categories", headers=headers)
        
        assert response.status_code == 200, f"Failed to get categories: {response.text}"
        categories = response.json()
        
        # Should have at least 5 default categories (auto-seeded)
        assert len(categories) >= 5, f"Expected at least 5 categories, got {len(categories)}"
        
        # Verify category structure
        for cat in categories:
            assert "category_id" in cat
            assert "name" in cat
            assert "scale_min" in cat
            assert "scale_max" in cat
            assert "is_active" in cat
        
        print(f"✓ Found {len(categories)} assessment categories")
        return categories
    
    def test_02_create_assessment_category(self):
        """Test creating a new assessment category"""
        headers = self.get_auth_headers()
        
        category_data = {
            "name": f"TEST_Category_{uuid.uuid4().hex[:6]}",
            "description": "Test category for NFC assessment",
            "scale_min": 1,
            "scale_max": 5,
            "is_active": True
        }
        
        response = self.session.post(f"{BASE_URL}/api/admin/assessment-categories", 
                                     headers=headers, json=category_data)
        
        assert response.status_code == 200, f"Failed to create category: {response.text}"
        data = response.json()
        
        assert "category_id" in data
        assert data["name"] == category_data["name"]
        assert data["scale_min"] == 1
        assert data["scale_max"] == 5
        
        self.test_category_id = data["category_id"]
        print(f"✓ Created assessment category: {data['category_id']}")
        return data
    
    def test_03_update_assessment_category(self):
        """Test updating an assessment category"""
        headers = self.get_auth_headers()
        
        # First create a category to update
        category_data = {
            "name": f"TEST_UpdateCat_{uuid.uuid4().hex[:6]}",
            "description": "Category to update",
            "scale_min": 1,
            "scale_max": 5,
            "is_active": True
        }
        
        create_response = self.session.post(f"{BASE_URL}/api/admin/assessment-categories", 
                                            headers=headers, json=category_data)
        assert create_response.status_code == 200
        category_id = create_response.json()["category_id"]
        
        # Update the category
        update_data = {
            "name": "TEST_Updated_Category",
            "description": "Updated description",
            "is_active": False
        }
        
        response = self.session.put(f"{BASE_URL}/api/admin/assessment-categories/{category_id}", 
                                    headers=headers, json=update_data)
        
        assert response.status_code == 200, f"Failed to update category: {response.text}"
        print(f"✓ Updated assessment category: {category_id}")
        
        # Cleanup - delete the test category
        self.session.delete(f"{BASE_URL}/api/admin/assessment-categories/{category_id}", headers=headers)
    
    def test_04_delete_assessment_category(self):
        """Test deleting an assessment category"""
        headers = self.get_auth_headers()
        
        # First create a category to delete
        category_data = {
            "name": f"TEST_DeleteCat_{uuid.uuid4().hex[:6]}",
            "description": "Category to delete",
            "scale_min": 1,
            "scale_max": 5,
            "is_active": True
        }
        
        create_response = self.session.post(f"{BASE_URL}/api/admin/assessment-categories", 
                                            headers=headers, json=category_data)
        assert create_response.status_code == 200
        category_id = create_response.json()["category_id"]
        
        # Delete the category
        response = self.session.delete(f"{BASE_URL}/api/admin/assessment-categories/{category_id}", 
                                       headers=headers)
        
        assert response.status_code == 200, f"Failed to delete category: {response.text}"
        print(f"✓ Deleted assessment category: {category_id}")
    
    # ==================== CREW UNITS TESTS ====================
    
    def test_05_get_crew_units(self):
        """Test getting units available for crew"""
        headers = self.get_auth_headers()
        response = self.session.get(f"{BASE_URL}/api/crew/units", headers=headers)
        
        assert response.status_code == 200, f"Failed to get crew units: {response.text}"
        units = response.json()
        
        print(f"✓ Found {len(units)} units available for crew")
        
        if len(units) > 0:
            # Verify unit structure
            unit = units[0]
            assert "unit_id" in unit
            assert "name" in unit
            assert "program_name" in unit
            self.test_unit_id = unit["unit_id"]
            print(f"  - First unit: {unit['name']} ({unit['program_name']})")
        
        return units
    
    # ==================== ATTENDANCE SESSION TESTS ====================
    
    def test_06_start_attendance_session(self):
        """Test starting an NFC attendance session"""
        headers = self.get_auth_headers()
        
        # First get available units
        units_response = self.session.get(f"{BASE_URL}/api/crew/units", headers=headers)
        units = units_response.json()
        
        if len(units) == 0:
            pytest.skip("No units available to start session")
        
        unit_id = units[0]["unit_id"]
        
        session_data = {
            "unit_id": unit_id,
            "session_name": f"TEST_Session_{uuid.uuid4().hex[:6]}",
            "notes": "Test session for NFC attendance"
        }
        
        response = self.session.post(f"{BASE_URL}/api/crew/attendance-session/start", 
                                     headers=headers, json=session_data)
        
        assert response.status_code == 200, f"Failed to start session: {response.text}"
        data = response.json()
        
        assert "session_id" in data
        assert data["status"] == "active"
        assert data["unit_id"] == unit_id
        assert "unit_name" in data
        assert "crew_id" in data
        
        self.test_session_id = data["session_id"]
        print(f"✓ Started attendance session: {data['session_id']}")
        print(f"  - Unit: {data['unit_name']}")
        print(f"  - Status: {data['status']}")
        
        return data
    
    def test_07_get_active_session(self):
        """Test getting the active session for crew"""
        headers = self.get_auth_headers()
        
        # First start a session
        units_response = self.session.get(f"{BASE_URL}/api/crew/units", headers=headers)
        units = units_response.json()
        
        if len(units) == 0:
            pytest.skip("No units available")
        
        # Start a new session
        session_data = {
            "unit_id": units[0]["unit_id"],
            "session_name": f"TEST_ActiveSession_{uuid.uuid4().hex[:6]}"
        }
        
        start_response = self.session.post(f"{BASE_URL}/api/crew/attendance-session/start", 
                                           headers=headers, json=session_data)
        assert start_response.status_code == 200
        session_id = start_response.json()["session_id"]
        
        # Get active session
        response = self.session.get(f"{BASE_URL}/api/crew/active-session", headers=headers)
        
        assert response.status_code == 200, f"Failed to get active session: {response.text}"
        data = response.json()
        
        if data:
            assert data["status"] == "active"
            print(f"✓ Active session found: {data['session_id']}")
        else:
            print("✓ No active session (expected if previous session was ended)")
        
        # Cleanup - end the session
        self.session.put(f"{BASE_URL}/api/crew/attendance-session/{session_id}/end", headers=headers)
        
        return data
    
    def test_08_get_session_details(self):
        """Test getting session details with attendance records"""
        headers = self.get_auth_headers()
        
        # First start a session
        units_response = self.session.get(f"{BASE_URL}/api/crew/units", headers=headers)
        units = units_response.json()
        
        if len(units) == 0:
            pytest.skip("No units available")
        
        session_data = {
            "unit_id": units[0]["unit_id"],
            "session_name": f"TEST_DetailSession_{uuid.uuid4().hex[:6]}"
        }
        
        start_response = self.session.post(f"{BASE_URL}/api/crew/attendance-session/start", 
                                           headers=headers, json=session_data)
        assert start_response.status_code == 200
        session_id = start_response.json()["session_id"]
        
        # Get session details
        response = self.session.get(f"{BASE_URL}/api/crew/attendance-session/{session_id}", 
                                    headers=headers)
        
        assert response.status_code == 200, f"Failed to get session details: {response.text}"
        data = response.json()
        
        assert "session_id" in data
        assert "attendance_records" in data
        assert "unit_name" in data
        
        print(f"✓ Got session details: {data['session_id']}")
        print(f"  - Attendance records: {len(data['attendance_records'])}")
        
        # Cleanup
        self.session.put(f"{BASE_URL}/api/crew/attendance-session/{session_id}/end", headers=headers)
        
        return data
    
    def test_09_end_attendance_session(self):
        """Test ending an attendance session"""
        headers = self.get_auth_headers()
        
        # First start a session
        units_response = self.session.get(f"{BASE_URL}/api/crew/units", headers=headers)
        units = units_response.json()
        
        if len(units) == 0:
            pytest.skip("No units available")
        
        session_data = {
            "unit_id": units[0]["unit_id"],
            "session_name": f"TEST_EndSession_{uuid.uuid4().hex[:6]}"
        }
        
        start_response = self.session.post(f"{BASE_URL}/api/crew/attendance-session/start", 
                                           headers=headers, json=session_data)
        assert start_response.status_code == 200
        session_id = start_response.json()["session_id"]
        
        # End the session
        response = self.session.put(f"{BASE_URL}/api/crew/attendance-session/{session_id}/end", 
                                    headers=headers)
        
        assert response.status_code == 200, f"Failed to end session: {response.text}"
        data = response.json()
        
        assert data["status"] == "completed"
        assert "ended_at" in data
        
        print(f"✓ Ended attendance session: {session_id}")
        print(f"  - Status: {data['status']}")
        
        return data
    
    def test_10_get_crew_sessions_history(self):
        """Test getting all attendance sessions for crew"""
        headers = self.get_auth_headers()
        response = self.session.get(f"{BASE_URL}/api/crew/attendance-sessions", headers=headers)
        
        assert response.status_code == 200, f"Failed to get sessions: {response.text}"
        sessions = response.json()
        
        print(f"✓ Found {len(sessions)} attendance sessions in history")
        
        if len(sessions) > 0:
            # Verify session structure
            session = sessions[0]
            assert "session_id" in session
            assert "unit_name" in session
            assert "status" in session
        
        return sessions
    
    # ==================== NFC TAP ATTENDANCE TESTS ====================
    
    def test_11_nfc_tap_attendance_no_student(self):
        """Test NFC tap with non-existent student NFC"""
        headers = self.get_auth_headers()
        
        # First start a session
        units_response = self.session.get(f"{BASE_URL}/api/crew/units", headers=headers)
        units = units_response.json()
        
        if len(units) == 0:
            pytest.skip("No units available")
        
        session_data = {
            "unit_id": units[0]["unit_id"],
            "session_name": f"TEST_NFCTapSession_{uuid.uuid4().hex[:6]}"
        }
        
        start_response = self.session.post(f"{BASE_URL}/api/crew/attendance-session/start", 
                                           headers=headers, json=session_data)
        assert start_response.status_code == 200
        session_id = start_response.json()["session_id"]
        
        # Try NFC tap with non-existent NFC ID
        tap_data = {
            "nfc_card_id": "NFC_NONEXISTENT_12345",
            "session_id": session_id
        }
        
        response = self.session.post(f"{BASE_URL}/api/crew/attendance-session/{session_id}/nfc-tap", 
                                     headers=headers, json=tap_data)
        
        # Should return 404 for non-existent student
        assert response.status_code == 404, f"Expected 404, got {response.status_code}: {response.text}"
        print("✓ NFC tap correctly rejects non-existent NFC ID")
        
        # Cleanup
        self.session.put(f"{BASE_URL}/api/crew/attendance-session/{session_id}/end", headers=headers)
    
    def test_12_nfc_tap_inactive_session(self):
        """Test NFC tap on an ended session"""
        headers = self.get_auth_headers()
        
        # First start and end a session
        units_response = self.session.get(f"{BASE_URL}/api/crew/units", headers=headers)
        units = units_response.json()
        
        if len(units) == 0:
            pytest.skip("No units available")
        
        session_data = {
            "unit_id": units[0]["unit_id"],
            "session_name": f"TEST_InactiveSession_{uuid.uuid4().hex[:6]}"
        }
        
        start_response = self.session.post(f"{BASE_URL}/api/crew/attendance-session/start", 
                                           headers=headers, json=session_data)
        assert start_response.status_code == 200
        session_id = start_response.json()["session_id"]
        
        # End the session
        self.session.put(f"{BASE_URL}/api/crew/attendance-session/{session_id}/end", headers=headers)
        
        # Try NFC tap on ended session
        tap_data = {
            "nfc_card_id": "NFC_TEST123",
            "session_id": session_id
        }
        
        response = self.session.post(f"{BASE_URL}/api/crew/attendance-session/{session_id}/nfc-tap", 
                                     headers=headers, json=tap_data)
        
        # Should return 400 for inactive session
        assert response.status_code == 400, f"Expected 400, got {response.status_code}: {response.text}"
        print("✓ NFC tap correctly rejects inactive session")
    
    # ==================== ASSESSMENT SUBMISSION TESTS ====================
    
    def test_13_assessment_submission_invalid_crew_nfc(self):
        """Test assessment submission with invalid crew NFC"""
        headers = self.get_auth_headers()
        
        # Get categories
        categories_response = self.session.get(f"{BASE_URL}/api/admin/assessment-categories", headers=headers)
        categories = categories_response.json()
        
        if len(categories) == 0:
            pytest.skip("No assessment categories available")
        
        # Build ratings dict
        ratings = {}
        for cat in categories[:3]:  # Use first 3 categories
            ratings[cat["category_id"]] = 4
        
        assessment_data = {
            "student_id": "std_nonexistent",
            "session_id": "sess_test",
            "unit_id": "unit_test",
            "ratings": ratings,
            "notes": "Test assessment",
            "crew_nfc_confirmation": "NFC_INVALID_CREW"
        }
        
        response = self.session.post(f"{BASE_URL}/api/crew/assessment/nfc-submit", 
                                     headers=headers, json=assessment_data)
        
        # Should fail due to invalid crew NFC or student not found
        assert response.status_code in [400, 404], f"Expected 400/404, got {response.status_code}: {response.text}"
        print("✓ Assessment submission correctly validates crew NFC/student")
    
    # ==================== INTEGRATION TESTS ====================
    
    def test_14_full_attendance_flow(self):
        """Test complete attendance flow: start session -> end session"""
        headers = self.get_auth_headers()
        
        # Get units
        units_response = self.session.get(f"{BASE_URL}/api/crew/units", headers=headers)
        units = units_response.json()
        
        if len(units) == 0:
            pytest.skip("No units available for full flow test")
        
        # First, end ALL existing active sessions
        sessions_response = self.session.get(f"{BASE_URL}/api/crew/attendance-sessions", headers=headers)
        if sessions_response.status_code == 200:
            all_sessions = sessions_response.json()
            active_sessions = [s for s in all_sessions if s.get("status") == "active"]
            for active_sess in active_sessions:
                self.session.put(f"{BASE_URL}/api/crew/attendance-session/{active_sess['session_id']}/end", headers=headers)
                print(f"  0. Ended existing active session: {active_sess['session_id']}")
        
        # 1. Start session
        session_data = {
            "unit_id": units[0]["unit_id"],
            "session_name": f"TEST_FullFlow_{uuid.uuid4().hex[:6]}",
            "notes": "Full flow integration test"
        }
        
        start_response = self.session.post(f"{BASE_URL}/api/crew/attendance-session/start", 
                                           headers=headers, json=session_data)
        assert start_response.status_code == 200
        session = start_response.json()
        session_id = session["session_id"]
        print(f"  1. Started session: {session_id}")
        
        # 2. Verify active session
        active_response = self.session.get(f"{BASE_URL}/api/crew/active-session", headers=headers)
        assert active_response.status_code == 200
        active_session = active_response.json()
        assert active_session is not None
        assert active_session["session_id"] == session_id
        print(f"  2. Verified active session")
        
        # 3. Get session details
        details_response = self.session.get(f"{BASE_URL}/api/crew/attendance-session/{session_id}", 
                                            headers=headers)
        assert details_response.status_code == 200
        details = details_response.json()
        assert details["attendance_count"] == 0
        print(f"  3. Got session details (0 attendees)")
        
        # 4. End session
        end_response = self.session.put(f"{BASE_URL}/api/crew/attendance-session/{session_id}/end", 
                                        headers=headers)
        assert end_response.status_code == 200
        ended_session = end_response.json()
        assert ended_session["status"] == "completed"
        print(f"  4. Ended session successfully")
        
        # 5. Verify session in history
        history_response = self.session.get(f"{BASE_URL}/api/crew/attendance-sessions", headers=headers)
        assert history_response.status_code == 200
        sessions = history_response.json()
        session_ids = [s["session_id"] for s in sessions]
        assert session_id in session_ids
        print(f"  5. Session found in history")
        
        print("✓ Full attendance flow completed successfully")


class TestAdminAssessmentCategoriesUI:
    """Test Assessment Categories from Admin Panel perspective"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
    def get_admin_token(self):
        response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json().get("token")
    
    def test_admin_can_view_categories(self):
        """Admin can view all assessment categories"""
        token = self.get_admin_token()
        headers = {"Authorization": f"Bearer {token}"}
        
        response = self.session.get(f"{BASE_URL}/api/admin/assessment-categories", headers=headers)
        
        assert response.status_code == 200
        categories = response.json()
        assert isinstance(categories, list)
        print(f"✓ Admin can view {len(categories)} assessment categories")
    
    def test_admin_crud_category(self):
        """Admin can create, update, and delete assessment category"""
        token = self.get_admin_token()
        headers = {"Authorization": f"Bearer {token}"}
        
        # Create
        create_data = {
            "name": f"TEST_AdminCRUD_{uuid.uuid4().hex[:6]}",
            "description": "Admin CRUD test",
            "scale_min": 1,
            "scale_max": 10,
            "is_active": True
        }
        
        create_response = self.session.post(f"{BASE_URL}/api/admin/assessment-categories", 
                                            headers=headers, json=create_data)
        assert create_response.status_code == 200
        category = create_response.json()
        category_id = category["category_id"]
        print(f"  - Created: {category_id}")
        
        # Update
        update_data = {"name": "TEST_AdminCRUD_Updated", "scale_max": 5}
        update_response = self.session.put(f"{BASE_URL}/api/admin/assessment-categories/{category_id}", 
                                           headers=headers, json=update_data)
        assert update_response.status_code == 200
        print(f"  - Updated: {category_id}")
        
        # Delete
        delete_response = self.session.delete(f"{BASE_URL}/api/admin/assessment-categories/{category_id}", 
                                              headers=headers)
        assert delete_response.status_code == 200
        print(f"  - Deleted: {category_id}")
        
        print("✓ Admin CRUD operations on assessment categories work correctly")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
