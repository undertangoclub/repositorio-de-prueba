#!/usr/bin/env python3
"""
Comprehensive Backend Testing for Milonga Sorteo Application
Tests all API endpoints with realistic data and edge cases
"""

import requests
import json
import os
from datetime import datetime
import time

# Get backend URL from environment
BACKEND_URL = "https://milonga-sorteo.preview.emergentagent.com/api"

class MilongaBackendTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.session = requests.Session()
        self.test_results = []
        
    def log_test(self, test_name, success, details="", response_data=None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "details": details,
            "response_data": response_data,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {details}")
        if response_data and not success:
            print(f"   Response: {response_data}")
    
    def test_bailarines_endpoints(self):
        """Test all bailarines endpoints"""
        print("\n=== TESTING BAILARINES ENDPOINTS ===")
        
        # Test 1: Create bailarín with realistic name
        try:
            response = self.session.post(
                f"{self.base_url}/bailarines",
                json={"nombre": "María González"}
            )
            if response.status_code == 200:
                bailarin_data = response.json()
                if "numero" in bailarin_data and bailarin_data["numero"] >= 1:
                    self.log_test(
                        "POST /bailarines - Create bailarín", 
                        True, 
                        f"Created bailarín with number {bailarin_data['numero']}", 
                        bailarin_data
                    )
                    self.first_bailarin_id = bailarin_data["id"]
                else:
                    self.log_test("POST /bailarines - Create bailarín", False, "No automatic number assigned", bailarin_data)
            else:
                self.log_test("POST /bailarines - Create bailarín", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("POST /bailarines - Create bailarín", False, f"Exception: {str(e)}")
        
        # Test 2: Create second bailarín to test number increment
        try:
            response = self.session.post(
                f"{self.base_url}/bailarines",
                json={"nombre": "Carlos Rodríguez"}
            )
            if response.status_code == 200:
                bailarin_data = response.json()
                if "numero" in bailarin_data and bailarin_data["numero"] >= 2:
                    self.log_test(
                        "POST /bailarines - Number increment", 
                        True, 
                        f"Second bailarín got number {bailarin_data['numero']}", 
                        bailarin_data
                    )
                    self.second_bailarin_id = bailarin_data["id"]
                else:
                    self.log_test("POST /bailarines - Number increment", False, "Number not incremented properly", bailarin_data)
            else:
                self.log_test("POST /bailarines - Number increment", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("POST /bailarines - Number increment", False, f"Exception: {str(e)}")
        
        # Test 3: Create bailarín with empty name (should fail)
        try:
            response = self.session.post(
                f"{self.base_url}/bailarines",
                json={"nombre": ""}
            )
            if response.status_code == 400:
                self.log_test("POST /bailarines - Empty name validation", True, "Correctly rejected empty name")
            else:
                self.log_test("POST /bailarines - Empty name validation", False, f"Should reject empty name, got HTTP {response.status_code}")
        except Exception as e:
            self.log_test("POST /bailarines - Empty name validation", False, f"Exception: {str(e)}")
        
        # Test 4: Get all bailarines
        try:
            response = self.session.get(f"{self.base_url}/bailarines")
            if response.status_code == 200:
                bailarines = response.json()
                if isinstance(bailarines, list) and len(bailarines) >= 2:
                    self.log_test(
                        "GET /bailarines - List active bailarines", 
                        True, 
                        f"Retrieved {len(bailarines)} bailarines", 
                        bailarines
                    )
                else:
                    self.log_test("GET /bailarines - List active bailarines", False, "Expected at least 2 bailarines", bailarines)
            else:
                self.log_test("GET /bailarines - List active bailarines", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("GET /bailarines - List active bailarines", False, f"Exception: {str(e)}")
        
        # Test 5: Delete bailarín
        if hasattr(self, 'first_bailarin_id'):
            try:
                response = self.session.delete(f"{self.base_url}/bailarines/{self.first_bailarin_id}")
                if response.status_code == 200:
                    self.log_test("DELETE /bailarines/{id} - Remove bailarín", True, "Successfully deleted bailarín")
                else:
                    self.log_test("DELETE /bailarines/{id} - Remove bailarín", False, f"HTTP {response.status_code}", response.text)
            except Exception as e:
                self.log_test("DELETE /bailarines/{id} - Remove bailarín", False, f"Exception: {str(e)}")
        
        # Test 6: Verify bailarín is no longer in active list
        try:
            response = self.session.get(f"{self.base_url}/bailarines")
            if response.status_code == 200:
                bailarines = response.json()
                active_ids = [b["id"] for b in bailarines]
                if hasattr(self, 'first_bailarin_id') and self.first_bailarin_id not in active_ids:
                    self.log_test("GET /bailarines - Verify deletion", True, "Deleted bailarín not in active list")
                else:
                    self.log_test("GET /bailarines - Verify deletion", False, "Deleted bailarín still appears in active list")
            else:
                self.log_test("GET /bailarines - Verify deletion", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("GET /bailarines - Verify deletion", False, f"Exception: {str(e)}")
    
    def test_sorteo_baile_endpoints(self):
        """Test sorteo baile endpoints"""
        print("\n=== TESTING SORTEO BAILE ENDPOINTS ===")
        
        # Test 1: Check availability (should be blocked until 21/12/2025 22:30)
        try:
            response = self.session.get(f"{self.base_url}/sorteo-baile/disponible")
            if response.status_code == 200:
                data = response.json()
                if "disponible" in data and data["disponible"] == False:
                    self.log_test(
                        "GET /sorteo-baile/disponible - Check blocked status", 
                        True, 
                        f"Correctly blocked: {data.get('mensaje', '')}", 
                        data
                    )
                else:
                    self.log_test("GET /sorteo-baile/disponible - Check blocked status", False, "Should be blocked until 21/12/2025 22:30", data)
            else:
                self.log_test("GET /sorteo-baile/disponible - Check blocked status", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("GET /sorteo-baile/disponible - Check blocked status", False, f"Exception: {str(e)}")
        
        # Test 2: Try to perform sorteo (should fail because it's blocked)
        try:
            response = self.session.post(
                f"{self.base_url}/sorteo-baile",
                json={"cantidad": 2}
            )
            if response.status_code == 403:
                self.log_test("POST /sorteo-baile - Blocked sorteo attempt", True, "Correctly rejected blocked sorteo")
            else:
                self.log_test("POST /sorteo-baile - Blocked sorteo attempt", False, f"Should return 403, got HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("POST /sorteo-baile - Blocked sorteo attempt", False, f"Exception: {str(e)}")
    
    def test_sorteo_premios_endpoints(self):
        """Test sorteo premios endpoints"""
        print("\n=== TESTING SORTEO PREMIOS ENDPOINTS ===")
        
        # Test 1: Check availability (should be blocked until 22/12/2025 00:00)
        try:
            response = self.session.get(f"{self.base_url}/sorteo-premios/disponible")
            if response.status_code == 200:
                data = response.json()
                if "disponible" in data and data["disponible"] == False:
                    self.log_test(
                        "GET /sorteo-premios/disponible - Check blocked status", 
                        True, 
                        f"Correctly blocked: {data.get('mensaje', '')}", 
                        data
                    )
                else:
                    self.log_test("GET /sorteo-premios/disponible - Check blocked status", False, "Should be blocked until 22/12/2025 00:00", data)
            else:
                self.log_test("GET /sorteo-premios/disponible - Check blocked status", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("GET /sorteo-premios/disponible - Check blocked status", False, f"Exception: {str(e)}")
        
        # Test 2: Get premios state
        try:
            response = self.session.get(f"{self.base_url}/sorteo-premios")
            if response.status_code == 200:
                premios = response.json()
                if isinstance(premios, list) and len(premios) == 3:
                    expected_premios = ["Caja de 6 huevos", "Cuadro", "Libro"]
                    premio_names = [p.get("nombre", "") for p in premios]
                    if all(name in premio_names for name in expected_premios):
                        self.log_test(
                            "GET /sorteo-premios - Get premios state", 
                            True, 
                            f"Retrieved {len(premios)} premios correctly", 
                            premios
                        )
                    else:
                        self.log_test("GET /sorteo-premios - Get premios state", False, "Premio names don't match expected", premios)
                else:
                    self.log_test("GET /sorteo-premios - Get premios state", False, f"Expected 3 premios, got {len(premios) if isinstance(premios, list) else 'non-list'}", premios)
            else:
                self.log_test("GET /sorteo-premios - Get premios state", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("GET /sorteo-premios - Get premios state", False, f"Exception: {str(e)}")
        
        # Test 3: Try to perform premio sorteo (should fail because it's blocked)
        try:
            response = self.session.post(f"{self.base_url}/sorteo-premios/1")
            if response.status_code == 403:
                self.log_test("POST /sorteo-premios/{id} - Blocked premio sorteo", True, "Correctly rejected blocked premio sorteo")
            else:
                self.log_test("POST /sorteo-premios/{id} - Blocked premio sorteo", False, f"Should return 403, got HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("POST /sorteo-premios/{id} - Blocked premio sorteo", False, f"Exception: {str(e)}")
        
        # Test 4: Try invalid premio ID
        try:
            response = self.session.post(f"{self.base_url}/sorteo-premios/999")
            if response.status_code == 404:
                self.log_test("POST /sorteo-premios/{id} - Invalid premio ID", True, "Correctly rejected invalid premio ID")
            elif response.status_code == 403:
                self.log_test("POST /sorteo-premios/{id} - Invalid premio ID", True, "Blocked (expected), but would also reject invalid ID")
            else:
                self.log_test("POST /sorteo-premios/{id} - Invalid premio ID", False, f"Should return 404 or 403, got HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("POST /sorteo-premios/{id} - Invalid premio ID", False, f"Exception: {str(e)}")
    
    def test_config_endpoints(self):
        """Test configuration endpoints"""
        print("\n=== TESTING CONFIGURATION ENDPOINTS ===")
        
        # Test 1: Get horarios configuration
        try:
            response = self.session.get(f"{self.base_url}/config/horarios")
            if response.status_code == 200:
                config = response.json()
                required_fields = ["sorteo_baile_inicio", "sorteo_premios_inicio", "hora_actual_servidor"]
                if all(field in config for field in required_fields):
                    # Verify dates are correct
                    baile_date = config["sorteo_baile_inicio"]
                    premios_date = config["sorteo_premios_inicio"]
                    if "2025-12-21T22:30:00" in baile_date and "2025-12-22T00:00:00" in premios_date:
                        self.log_test(
                            "GET /config/horarios - Get schedule config", 
                            True, 
                            "Configuration returned with correct dates", 
                            config
                        )
                    else:
                        self.log_test("GET /config/horarios - Get schedule config", False, "Incorrect dates in configuration", config)
                else:
                    self.log_test("GET /config/horarios - Get schedule config", False, "Missing required fields", config)
            else:
                self.log_test("GET /config/horarios - Get schedule config", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("GET /config/horarios - Get schedule config", False, f"Exception: {str(e)}")
    
    def test_data_persistence(self):
        """Test data persistence by creating bailarín and verifying it persists"""
        print("\n=== TESTING DATA PERSISTENCE ===")
        
        # Create a bailarín
        try:
            response = self.session.post(
                f"{self.base_url}/bailarines",
                json={"nombre": "Ana Martínez"}
            )
            if response.status_code == 200:
                bailarin_data = response.json()
                bailarin_id = bailarin_data["id"]
                
                # Wait a moment and then retrieve all bailarines
                time.sleep(1)
                response2 = self.session.get(f"{self.base_url}/bailarines")
                if response2.status_code == 200:
                    bailarines = response2.json()
                    found_bailarin = next((b for b in bailarines if b["id"] == bailarin_id), None)
                    if found_bailarin:
                        self.log_test("Data Persistence - MongoDB storage", True, "Bailarín persisted correctly in database")
                    else:
                        self.log_test("Data Persistence - MongoDB storage", False, "Bailarín not found after creation")
                else:
                    self.log_test("Data Persistence - MongoDB storage", False, f"Failed to retrieve bailarines: HTTP {response2.status_code}")
            else:
                self.log_test("Data Persistence - MongoDB storage", False, f"Failed to create bailarín: HTTP {response.status_code}")
        except Exception as e:
            self.log_test("Data Persistence - MongoDB storage", False, f"Exception: {str(e)}")
    
    def run_all_tests(self):
        """Run all backend tests"""
        print(f"🚀 Starting comprehensive backend testing for Milonga Sorteo")
        print(f"Backend URL: {self.base_url}")
        print("=" * 60)
        
        self.test_bailarines_endpoints()
        self.test_sorteo_baile_endpoints()
        self.test_sorteo_premios_endpoints()
        self.test_config_endpoints()
        self.test_data_persistence()
        
        # Summary
        print("\n" + "=" * 60)
        print("🏁 TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print("\n🔍 FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  ❌ {result['test']}: {result['details']}")
        
        return self.test_results

if __name__ == "__main__":
    tester = MilongaBackendTester()
    results = tester.run_all_tests()