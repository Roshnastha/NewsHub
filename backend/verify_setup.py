#!/usr/bin/env python3
"""
Verify Video Deepfake Detection Backend Setup
Checks all required files, packages, and configurations
"""

import sys
import os
from pathlib import Path

# Colors for output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'

def print_status(status, message):
    if status == "OK":
        print(f"{GREEN}✓ {message}{RESET}")
        return True
    elif status == "WARN":
        print(f"{YELLOW}⚠ {message}{RESET}")
        return True
    else:
        print(f"{RED}✗ {message}{RESET}")
        return False

def check_files():
    """Check if all required files exist"""
    print(f"\n{BLUE}=== Checking Files ==={RESET}")
    
    backend_dir = Path(__file__).parent
    checks = [
        (backend_dir / "main.py", "main.py exists"),
        (backend_dir / "requirements.txt", "requirements.txt exists"),
        (backend_dir / "README.md", "README.md exists"),
        (backend_dir / "model", "model/ folder exists"),
    ]
    
    all_ok = True
    for path, desc in checks:
        exists = path.exists()
        print_status("OK" if exists else "FAIL", desc)
        all_ok = all_ok and exists
    
    # Check for model.onnx
    model_file = backend_dir / "model" / "model.onnx"
    exists = model_file.exists()
    print_status("OK" if exists else "WARN", f"model.onnx exists in model/")
    
    return all_ok

def check_packages():
    """Check if required Python packages are installed"""
    print(f"\n{BLUE}=== Checking Python Packages ==={RESET}")
    
    required_packages = {
        'fastapi': 'FastAPI',
        'uvicorn': 'Uvicorn',
        'cv2': 'OpenCV (cv2)',
        'onnxruntime': 'ONNX Runtime',
        'numpy': 'NumPy',
        'pydantic': 'Pydantic',
        'multipart': 'python-multipart',
    }
    
    all_ok = True
    for import_name, display_name in required_packages.items():
        try:
            __import__(import_name)
            print_status("OK", f"{display_name} is installed")
        except ImportError:
            print_status("FAIL", f"{display_name} is NOT installed")
            all_ok = False
    
    return all_ok

def check_python_version():
    """Check Python version"""
    print(f"\n{BLUE}=== Checking Python Version ==={RESET}")
    
    version = f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}"
    print_status("OK", f"Python {version}")
    
    if sys.version_info < (3, 7):
        print_status("WARN", "Python 3.7 or higher is recommended")
        return False
    
    return True

def check_model_onnx():
    """Check if model.onnx is valid ONNX file"""
    print(f"\n{BLUE}=== Checking ONNX Model ==={RESET}")
    
    backend_dir = Path(__file__).parent
    model_file = backend_dir / "model" / "model.onnx"
    
    if not model_file.exists():
        print_status("FAIL", f"model.onnx not found at {model_file}")
        return False
    
    print_status("OK", f"model.onnx found at {model_file}")
    
    # Try to load with onnxruntime
    try:
        import onnxruntime as ort
        session = ort.InferenceSession(str(model_file))
        input_name = session.get_inputs()[0].name
        output_name = session.get_outputs()[0].name
        input_shape = session.get_inputs()[0].shape
        
        print_status("OK", f"ONNX model loads successfully")
        print_status("OK", f"Input shape: {input_shape}")
        print_status("OK", f"Output name: {output_name}")
        return True
    except Exception as e:
        print_status("FAIL", f"Error loading ONNX model: {str(e)}")
        return False

def check_environment():
    """Check environment variables"""
    print(f"\n{BLUE}=== Checking Environment ==={RESET}")
    
    # Check if we're in virtual environment
    in_venv = hasattr(sys, 'real_prefix') or (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix)
    print_status("WARN" if not in_venv else "OK", f"Virtual environment: {'Active' if in_venv else 'NOT ACTIVE'}")
    
    return in_venv

def main():
    """Run all checks"""
    print(f"\n{BLUE}{'='*50}")
    print(f"Video Deepfake Detection Backend Verification")
    print(f"{'='*50}{RESET}\n")
    
    checks_results = {
        'Python Version': check_python_version(),
        'Files': check_files(),
        'Packages': check_packages(),
        'Environment': check_environment(),
        'ONNX Model': check_model_onnx(),
    }
    
    # Summary
    print(f"\n{BLUE}=== Summary ==={RESET}")
    
    failed = [name for name, result in checks_results.items() if not result]
    
    if not failed:
        print(f"{GREEN}✓ All checks passed! Backend is ready to run.{RESET}")
        print(f"\nRun the server with: {BLUE}python main.py{RESET}")
        return 0
    else:
        print(f"{RED}✗ Some checks failed:{RESET}")
        for name in failed:
            print(f"  - {name}")
        
        if 'Packages' in failed:
            print(f"\n{YELLOW}Install packages with: pip install -r requirements.txt{RESET}")
        
        if 'ONNX Model' in failed:
            print(f"\n{YELLOW}Add your model.onnx to: backend/model/model.onnx{RESET}")
        
        return 1

if __name__ == '__main__':
    exit(main())
