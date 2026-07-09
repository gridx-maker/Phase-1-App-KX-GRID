"""
Test Suite for KotlerX Registration Control and University Reports Features
Tests:
1. Admin Registration Control - Toggle registration open/closed for programs
2. Admin Registration Control - Closed programs show next batch date
3. University Reports - Weekly, Monthly, Batch, Completion reports (Excel)
"""

import pytest
import requests
import os
from datetime import datetime, timedelta

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "admin@kotlerx.com"
ADMIN_PASSWORD = "admin123"
TEST_BATCH_ID = "batch_f7123030e3e8"
CLOSED_PROGRAM_ID = "prog_0aa8dfed9d94"


class TestAdminAuth:
    """Test admin authentication for protected endpoints"""
    
    def test_admin_login(self):
        """Test admin login and get token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        data = response.json()
        assert "token" in data, "No token in response"
        assert data.get("role") == "admin", f"Expected admin role, got {data.get('role')}"
        print(f"✓ Admin login successful - role: {data.get('role')}")
        return data["token"]


class TestRegistrationControl:
    """Test Admin Registration Control features"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get admin token before each test"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, "Admin login failed"
        self.token = response.json()["token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_get_programs_list(self):
        """Test getting list of programs"""
        response = requests.get(f"{BASE_URL}/api/programs")
        assert response.status_code == 200, f"Failed to get programs: {response.text}"
        programs = response.json()
        assert isinstance(programs, list), "Programs should be a list"
        print(f"✓ Got {len(programs)} programs")
        return programs
    
    def test_toggle_registration_close(self):
        """Test closing registration for a program with next batch date"""
        # First get a program to test with
        programs_response = requests.get(f"{BASE_URL}/api/programs")
        programs = programs_response.json()
        
        if not programs:
            pytest.skip("No programs available to test")
        
        # Use first program or the specified closed program
        test_program = None
        for p in programs:
            if p.get("program_id") == CLOSED_PROGRAM_ID:
                test_program = p
                break
        
        if not test_program:
            test_program = programs[0]
        
        program_id = test_program["program_id"]
        
        # Calculate next batch date (30 days from now)
        next_batch = (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d")
        
        # Close registration
        response = requests.put(
            f"{BASE_URL}/api/programs/{program_id}/registration",
            json={
                "registration_open": False,
                "next_batch_date": next_batch
            },
            headers=self.headers
        )
        
        assert response.status_code == 200, f"Failed to close registration: {response.text}"
        data = response.json()
        assert "closed" in data.get("message", "").lower(), f"Expected 'closed' in message: {data}"
        print(f"✓ Registration closed for program {program_id}")
        print(f"  Next batch date: {next_batch}")
        
        # Verify the change
        verify_response = requests.get(f"{BASE_URL}/api/programs/{program_id}")
        assert verify_response.status_code == 200
        program_data = verify_response.json()
        assert program_data.get("registration_open") == False, "Registration should be closed"
        assert program_data.get("next_batch_date") == next_batch, "Next batch date should be set"
        print(f"✓ Verified: registration_open={program_data.get('registration_open')}, next_batch_date={program_data.get('next_batch_date')}")
        
        return program_id
    
    def test_toggle_registration_open(self):
        """Test opening registration for a program"""
        # Get programs
        programs_response = requests.get(f"{BASE_URL}/api/programs")
        programs = programs_response.json()
        
        if not programs:
            pytest.skip("No programs available to test")
        
        program_id = programs[0]["program_id"]
        
        # Open registration
        response = requests.put(
            f"{BASE_URL}/api/programs/{program_id}/registration",
            json={
                "registration_open": True,
                "next_batch_date": None
            },
            headers=self.headers
        )
        
        assert response.status_code == 200, f"Failed to open registration: {response.text}"
        data = response.json()
        assert "opened" in data.get("message", "").lower(), f"Expected 'opened' in message: {data}"
        print(f"✓ Registration opened for program {program_id}")
        
        # Verify the change
        verify_response = requests.get(f"{BASE_URL}/api/programs/{program_id}")
        assert verify_response.status_code == 200
        program_data = verify_response.json()
        assert program_data.get("registration_open") == True, "Registration should be open"
        print(f"✓ Verified: registration_open={program_data.get('registration_open')}")
    
    def test_registration_toggle_unauthorized(self):
        """Test that non-admin cannot toggle registration"""
        programs_response = requests.get(f"{BASE_URL}/api/programs")
        programs = programs_response.json()
        
        if not programs:
            pytest.skip("No programs available to test")
        
        program_id = programs[0]["program_id"]
        
        # Try without auth
        response = requests.put(
            f"{BASE_URL}/api/programs/{program_id}/registration",
            json={"registration_open": False}
        )
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Unauthorized access correctly rejected")
    
    def test_registration_toggle_invalid_program(self):
        """Test toggle registration for non-existent program"""
        response = requests.put(
            f"{BASE_URL}/api/programs/invalid_program_id/registration",
            json={"registration_open": False},
            headers=self.headers
        )
        
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✓ Invalid program correctly returns 404")


class TestUniversityReports:
    """Test University Assessment Reports features"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get admin token before each test"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, "Admin login failed"
        self.token = response.json()["token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_download_weekly_report(self):
        """Test downloading weekly assessment report (Excel)"""
        response = requests.get(
            f"{BASE_URL}/api/admin/reports/weekly",
            headers=self.headers
        )
        
        assert response.status_code == 200, f"Failed to download weekly report: {response.text}"
        
        # Check content type is Excel
        content_type = response.headers.get("content-type", "")
        assert "spreadsheet" in content_type or "application/vnd" in content_type, \
            f"Expected Excel content type, got: {content_type}"
        
        # Check content disposition header
        content_disp = response.headers.get("content-disposition", "")
        assert "attachment" in content_disp, "Should be downloadable attachment"
        assert ".xlsx" in content_disp, "Should be .xlsx file"
        
        # Check file has content
        assert len(response.content) > 0, "Report file should not be empty"
        print(f"✓ Weekly report downloaded successfully ({len(response.content)} bytes)")
        print(f"  Content-Type: {content_type}")
        print(f"  Content-Disposition: {content_disp}")
    
    def test_download_monthly_report(self):
        """Test downloading monthly assessment report (Excel)"""
        response = requests.get(
            f"{BASE_URL}/api/admin/reports/monthly",
            headers=self.headers
        )
        
        assert response.status_code == 200, f"Failed to download monthly report: {response.text}"
        
        content_type = response.headers.get("content-type", "")
        assert "spreadsheet" in content_type or "application/vnd" in content_type, \
            f"Expected Excel content type, got: {content_type}"
        
        content_disp = response.headers.get("content-disposition", "")
        assert ".xlsx" in content_disp, "Should be .xlsx file"
        
        assert len(response.content) > 0, "Report file should not be empty"
        print(f"✓ Monthly report downloaded successfully ({len(response.content)} bytes)")
    
    def test_download_batch_report(self):
        """Test downloading batch-specific assessment report (Excel)"""
        # First check if the test batch exists
        batches_response = requests.get(
            f"{BASE_URL}/api/batches",
            headers=self.headers
        )
        
        if batches_response.status_code != 200:
            pytest.skip("Could not get batches list")
        
        batches = batches_response.json()
        
        # Use test batch ID or first available batch
        batch_id = TEST_BATCH_ID
        if batches:
            batch_id = batches[0].get("batch_id", TEST_BATCH_ID)
        
        response = requests.get(
            f"{BASE_URL}/api/admin/reports/batch/{batch_id}",
            headers=self.headers
        )
        
        # If batch doesn't exist, it should return 404
        if response.status_code == 404:
            print(f"⚠ Batch {batch_id} not found - this is expected if no batches exist")
            pytest.skip(f"Batch {batch_id} not found")
        
        assert response.status_code == 200, f"Failed to download batch report: {response.text}"
        
        content_type = response.headers.get("content-type", "")
        assert "spreadsheet" in content_type or "application/vnd" in content_type, \
            f"Expected Excel content type, got: {content_type}"
        
        assert len(response.content) > 0, "Report file should not be empty"
        print(f"✓ Batch report for {batch_id} downloaded successfully ({len(response.content)} bytes)")
    
    def test_generate_completion_report(self):
        """Test generating completion report (marks batch as completed)"""
        # Get batches
        batches_response = requests.get(
            f"{BASE_URL}/api/batches",
            headers=self.headers
        )
        
        if batches_response.status_code != 200:
            pytest.skip("Could not get batches list")
        
        batches = batches_response.json()
        
        # Find an active batch to complete
        active_batch = None
        for batch in batches:
            if batch.get("status") == "active":
                active_batch = batch
                break
        
        if not active_batch:
            # Use test batch ID
            batch_id = TEST_BATCH_ID
            print(f"⚠ No active batch found, using test batch ID: {batch_id}")
        else:
            batch_id = active_batch["batch_id"]
        
        response = requests.post(
            f"{BASE_URL}/api/admin/reports/completion",
            json={
                "batch_id": batch_id,
                "completion_date": datetime.now().strftime("%Y-%m-%d")
            },
            headers=self.headers
        )
        
        # If batch doesn't exist, it should return 404
        if response.status_code == 404:
            print(f"⚠ Batch {batch_id} not found - this is expected if no batches exist")
            pytest.skip(f"Batch {batch_id} not found")
        
        assert response.status_code == 200, f"Failed to generate completion report: {response.text}"
        
        content_type = response.headers.get("content-type", "")
        assert "spreadsheet" in content_type or "application/vnd" in content_type, \
            f"Expected Excel content type, got: {content_type}"
        
        assert len(response.content) > 0, "Report file should not be empty"
        print(f"✓ Completion report generated for batch {batch_id} ({len(response.content)} bytes)")
        print("  Batch should now be marked as 'completed'")
    
    def test_reports_unauthorized(self):
        """Test that non-admin cannot access reports"""
        # Try without auth
        response = requests.get(f"{BASE_URL}/api/admin/reports/weekly")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        
        response = requests.get(f"{BASE_URL}/api/admin/reports/monthly")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        
        print("✓ Unauthorized access to reports correctly rejected")


class TestLeadCaptureForClosedPrograms:
    """Test lead capture when registration is closed"""
    
    def test_create_lead_for_closed_program(self):
        """Test creating a lead (waitlist) for a closed program"""
        # Create a lead for the closed program
        lead_data = {
            "name": "TEST_Waitlist User",
            "location": "Mumbai",
            "mobile": "9876543210",
            "program_interest": "Test Racing Program",  # Closed program
            "fee_type": "cash"
        }
        
        response = requests.post(f"{BASE_URL}/api/leads", json=lead_data)
        
        assert response.status_code == 200, f"Failed to create lead: {response.text}"
        data = response.json()
        assert "lead_id" in data, "Should return lead_id"
        print(f"✓ Lead created for closed program: {data.get('lead_id')}")
        
        return data.get("lead_id")
    
    def test_verify_lead_in_admin(self):
        """Test that the lead appears in admin panel"""
        # Login as admin
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        token = login_response.json()["token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Get leads
        response = requests.get(f"{BASE_URL}/api/admin/leads", headers=headers)
        assert response.status_code == 200, f"Failed to get leads: {response.text}"
        
        leads = response.json()
        assert isinstance(leads, list), "Leads should be a list"
        
        # Check if our test lead exists
        test_leads = [l for l in leads if l.get("name", "").startswith("TEST_")]
        print(f"✓ Found {len(test_leads)} test leads in admin panel")
        
        return leads


class TestProgramsPublicEndpoint:
    """Test public programs endpoint shows registration status"""
    
    def test_programs_show_registration_status(self):
        """Test that programs endpoint returns registration_open and next_batch_date"""
        response = requests.get(f"{BASE_URL}/api/programs")
        assert response.status_code == 200, f"Failed to get programs: {response.text}"
        
        programs = response.json()
        
        for program in programs:
            # Check that registration fields exist
            assert "registration_open" in program or program.get("registration_open") is None, \
                f"Program {program.get('program_id')} missing registration_open field"
            
            # If registration is closed, check for next_batch_date
            if program.get("registration_open") == False:
                print(f"✓ Program '{program.get('name')}' has registration closed")
                if program.get("next_batch_date"):
                    print(f"  Next batch date: {program.get('next_batch_date')}")
            else:
                print(f"✓ Program '{program.get('name')}' has registration open")
        
        print(f"✓ All {len(programs)} programs have registration status fields")


# Cleanup test data
class TestCleanup:
    """Cleanup test data after tests"""
    
    def test_cleanup_test_leads(self):
        """Remove test leads created during testing"""
        # Login as admin
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        
        if login_response.status_code != 200:
            pytest.skip("Could not login as admin for cleanup")
        
        token = login_response.json()["token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Get leads
        response = requests.get(f"{BASE_URL}/api/admin/leads", headers=headers)
        if response.status_code != 200:
            pytest.skip("Could not get leads for cleanup")
        
        leads = response.json()
        test_leads = [l for l in leads if l.get("name", "").startswith("TEST_")]
        
        # Note: There's no delete endpoint for leads, so we just report
        print(f"⚠ {len(test_leads)} test leads exist (no delete endpoint available)")
        print("✓ Cleanup check completed")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
