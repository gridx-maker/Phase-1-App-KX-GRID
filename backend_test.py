#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime
import uuid

class KotlerXAPITester:
    def __init__(self, base_url="https://unified-dashboard-48.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.student_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            
            if success:
                self.log_test(name, True)
                try:
                    return response.json() if response.content else {}
                except:
                    return {}
            else:
                self.log_test(name, False, f"Expected {expected_status}, got {response.status_code}")
                return None

        except Exception as e:
            self.log_test(name, False, f"Error: {str(e)}")
            return None

    def test_root_endpoint(self):
        """Test root API endpoint"""
        result = self.run_test("Root API Endpoint", "GET", "", 200)
        return result is not None

    def test_register_student(self):
        """Test student registration"""
        timestamp = datetime.now().strftime('%H%M%S')
        test_data = {
            "email": f"student_{timestamp}@test.com",
            "password": "TestPass123!",
            "name": f"Test Student {timestamp}",
            "role": "student"
        }
        
        result = self.run_test("Student Registration", "POST", "auth/register", 200, test_data)
        if result:
            self.token = result.get('token')
            self.user_id = result.get('user_id')
            return True
        return False

    def test_register_admin(self):
        """Test admin registration"""
        timestamp = datetime.now().strftime('%H%M%S')
        test_data = {
            "email": f"admin_{timestamp}@test.com",
            "password": "AdminPass123!",
            "name": f"Test Admin {timestamp}",
            "role": "admin"
        }
        
        result = self.run_test("Admin Registration", "POST", "auth/register", 200, test_data)
        return result is not None

    def test_login(self):
        """Test login with registered credentials"""
        if not self.user_id:
            return False
            
        # Use the same credentials from registration
        timestamp = datetime.now().strftime('%H%M%S')
        login_data = {
            "email": f"student_{timestamp}@test.com",
            "password": "TestPass123!"
        }
        
        result = self.run_test("User Login", "POST", "auth/login", 200, login_data)
        if result:
            self.token = result.get('token')
            return True
        return False

    def test_otp_flow(self):
        """Test OTP send and verify flow"""
        # Send OTP
        otp_data = {"phone": "+919876543210"}
        send_result = self.run_test("Send OTP", "POST", "otp/send", 200, otp_data)
        
        if send_result:
            # Verify OTP with mock OTP
            verify_data = {"phone": "+919876543210", "otp": "123456"}
            verify_result = self.run_test("Verify OTP", "POST", "otp/verify", 200, verify_data)
            return verify_result is not None
        return False

    def test_student_registration_complete(self):
        """Test complete student registration"""
        if not self.token or not self.user_id:
            return False
            
        student_data = {
            "user_id": self.user_id,
            "full_name": "Test Student Complete",
            "mobile": "9876543210",
            "age": 25,
            "blood_group": "O+",
            "address": "123 Test Street",
            "city": "Test City",
            "state": "Test State",
            "emergency_contact": "9876543211",
            "highest_degree": "Bachelor's",
            "occupation_type": "student",
            "occupation_detail": "Test College",
            "medical_conditions": ["None"],
            "blood_donation_willing": True
        }
        
        result = self.run_test("Complete Student Registration", "POST", "students/register", 200, student_data)
        if result:
            self.student_id = result.get('student_id')
            return True
        return False

    def test_programs_api(self):
        """Test programs listing"""
        result = self.run_test("List Programs", "GET", "programs", 200)
        return result is not None

    def test_leaderboard_api(self):
        """Test leaderboard"""
        result = self.run_test("Get Leaderboard", "GET", "leaderboard", 200)
        return result is not None

    def test_sop_api(self):
        """Test SOP endpoint"""
        result = self.run_test("Get SOP", "GET", "sop", 200)
        return result is not None

    def test_protected_endpoints(self):
        """Test protected endpoints that require authentication"""
        if not self.token:
            return False
            
        # Test get current user
        me_result = self.run_test("Get Current User", "GET", "auth/me", 200)
        
        # Test student profile
        profile_result = self.run_test("Get Student Profile", "GET", "students/profile", 200)
        
        return me_result is not None and profile_result is not None

    def test_admin_endpoints(self):
        """Test admin-only endpoints"""
        # First register an admin user
        timestamp = datetime.now().strftime('%H%M%S')
        admin_data = {
            "email": f"admin_test_{timestamp}@test.com",
            "password": "AdminPass123!",
            "name": f"Test Admin {timestamp}",
            "role": "admin"
        }
        
        admin_result = self.run_test("Register Admin User", "POST", "auth/register", 200, admin_data)
        if not admin_result:
            return False
            
        # Login as admin
        admin_login = {
            "email": f"admin_test_{timestamp}@test.com",
            "password": "AdminPass123!"
        }
        
        login_result = self.run_test("Admin Login", "POST", "auth/login", 200, admin_login)
        if not login_result:
            return False
            
        # Store admin token
        admin_token = login_result.get('token')
        original_token = self.token
        self.token = admin_token
        
        # Test admin stats
        stats_result = self.run_test("Get Admin Stats", "GET", "admin/stats", 200)
        
        # Test create program
        program_data = {
            "name": "Test Motorsport Program",
            "program_type": "certification",
            "description": "Test program for API testing",
            "duration_weeks": 4,
            "batch_size": 20
        }
        
        program_result = self.run_test("Create Program", "POST", "programs", 200, program_data)
        
        # Restore original token
        self.token = original_token
        
        return stats_result is not None and program_result is not None

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting KotlerX API Tests...")
        print(f"Testing against: {self.base_url}")
        print("-" * 50)
        
        # Core API tests
        self.test_root_endpoint()
        
        # Authentication flow
        self.test_register_student()
        self.test_login()
        
        # OTP flow
        self.test_otp_flow()
        
        # Student registration
        self.test_student_registration_complete()
        
        # Public endpoints
        self.test_programs_api()
        self.test_leaderboard_api()
        self.test_sop_api()
        
        # Protected endpoints
        self.test_protected_endpoints()
        
        # Admin endpoints
        self.test_admin_endpoints()
        
        # Print summary
        print("-" * 50)
        print(f"📊 Tests completed: {self.tests_passed}/{self.tests_run}")
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"📈 Success rate: {success_rate:.1f}%")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print("⚠️  Some tests failed")
            return 1

def main():
    tester = KotlerXAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())