import http.client
import json

def test_api():
    # 1. Login as Super Admin
    print("Logging in as Super Admin...")
    conn = http.client.HTTPConnection("localhost", 8000)
    headers = {"Content-type": "application/json"}
    login_data = {
        "email": "root@kotlerx.com",
        "password": "KXRoot@2024"
    }
    conn.request("POST", "/api/auth/login", json.dumps(login_data), headers)
    response = conn.getresponse()
    res_data = response.read().decode()
    print("Login Response Status:", response.status)
    print("Login Response Data:", res_data)
    
    if response.status != 200:
        print("Super admin login failed!")
        return

    res_json = json.loads(res_data)
    token = res_json.get("token") or res_json.get("access_token")
    print("Access token retrieved:", token[:20] + "..." if token else "None")

    # 2. Register a new user
    print("\nRegistering a new student user...")
    register_data = {
        "email": "student_test@kotlerx.com",
        "password": "StudentPassword123",
        "name": "Test Student",
        "role": "student"
    }
    # We must use /api/auth/register
    conn.request("POST", "/api/auth/register", json.dumps(register_data), headers)
    response2 = conn.getresponse()
    res_data2 = response2.read().decode()
    print("Register Response Status:", response2.status)
    print("Register Response Data:", res_data2)

    if response2.status in (200, 201):
        print("Registration successful!")
    elif "already registered" in res_data2.lower():
        print("User already registered, proceeding to login test.")
    else:
        print("Registration failed!")
        return

    # 3. Login with the newly registered user
    print("\nLogging in as the new student user...")
    student_login_data = {
        "email": "student_test@kotlerx.com",
        "password": "StudentPassword123"
    }
    conn.request("POST", "/api/auth/login", json.dumps(student_login_data), headers)
    response3 = conn.getresponse()
    res_data3 = response3.read().decode()
    print("Student Login Response Status:", response3.status)
    print("Student Login Response Data:", res_data3)

    if response3.status == 200:
        print("Student Login successful!")
    else:
        print("Student Login failed!")

if __name__ == "__main__":
    test_api()
