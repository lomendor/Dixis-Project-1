# 🐍 XERO INTEGRATION BRIDGE - PART 1: PYTHON SERVICE

## 🎯 TASK 3 EXECUTION - XERO PYTHON BRIDGE

### **1. Python Xero Service Foundation**

**xero_bridge.py:**
```python
#!/usr/bin/env python3
"""
Dixis Fresh - Xero Integration Bridge
Enterprise-grade Python service for Xero API integration
"""

import os
import sys
import json
import logging
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from pathlib import Path

# Xero Python SDK imports
from xero_python.api_client import Configuration, ApiClient
from xero_python.api_client.oauth2 import OAuth2Token
from xero_python.accounting import AccountingApi, Invoice, Contact, LineItem, Invoices
from xero_python.exceptions import ApiException

# Configuration and logging setup
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/var/log/dixis/xero_bridge.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger('XeroBridge')

@dataclass
class XeroConfig:
    """Xero configuration data class"""
    client_id: str
    client_secret: str
    tenant_id: str
    redirect_uri: str
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    
    @classmethod
    def from_env(cls) -> 'XeroConfig':
        """Load configuration from environment variables"""
        return cls(
            client_id=os.getenv('XERO_CLIENT_ID', ''),
            client_secret=os.getenv('XERO_CLIENT_SECRET', ''),
            tenant_id=os.getenv('XERO_TENANT_ID', ''),
            redirect_uri=os.getenv('XERO_REDIRECT_URI', ''),
            access_token=os.getenv('XERO_ACCESS_TOKEN'),
            refresh_token=os.getenv('XERO_REFRESH_TOKEN')
        )

class XeroBridgeService:
    """Main Xero integration service"""
    
    def __init__(self, config: XeroConfig):
        self.config = config
        self.api_client = None
        self.accounting_api = None
        self._initialize_client()
    
    def _initialize_client(self) -> None:
        """Initialize Xero API client with OAuth2 configuration"""
        try:
            # Create OAuth2 token
            oauth2_token = OAuth2Token(
                client_id=self.config.client_id,
                client_secret=self.config.client_secret
            )
            
            # Set tokens if available
            if self.config.access_token:
                oauth2_token.access_token = self.config.access_token
            if self.config.refresh_token:
                oauth2_token.refresh_token = self.config.refresh_token
            
            # Configure API client
            api_config = Configuration(oauth2_token=oauth2_token)
            self.api_client = ApiClient(
                api_config,
                oauth2_token_saver=self._save_tokens,
                oauth2_token_getter=self._get_tokens
            )
            
            # Initialize accounting API
            self.accounting_api = AccountingApi(self.api_client)
            
            logger.info("Xero API client initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize Xero client: {str(e)}")
            raise
    
    def _save_tokens(self, token_dict: Dict[str, Any]) -> None:
        """Save OAuth2 tokens (callback for token refresh)"""
        try:
            # Save to file for Laravel to read
            token_file = Path('/tmp/xero_tokens.json')
            with open(token_file, 'w') as f:
                json.dump({
                    'access_token': token_dict.get('access_token'),
                    'refresh_token': token_dict.get('refresh_token'),
                    'expires_at': token_dict.get('expires_at'),
                    'updated_at': datetime.now(timezone.utc).isoformat()
                }, f)
            
            logger.info("Xero tokens saved successfully")
            
        except Exception as e:
            logger.error(f"Failed to save tokens: {str(e)}")
    
    def _get_tokens(self) -> Dict[str, Any]:
        """Get OAuth2 tokens (callback for token retrieval)"""
        try:
            token_file = Path('/tmp/xero_tokens.json')
            if token_file.exists():
                with open(token_file, 'r') as f:
                    return json.load(f)
            return {}
        except Exception as e:
            logger.error(f"Failed to get tokens: {str(e)}")
            return {}
    
    def test_connection(self) -> Dict[str, Any]:
        """Test Xero API connection"""
        try:
            # Get organisation info to test connection
            organisations = self.accounting_api.get_organisations(self.config.tenant_id)
            
            if organisations and organisations.organisations:
                org = organisations.organisations[0]
                return {
                    'success': True,
                    'organisation_name': org.name,
                    'organisation_id': org.organisation_id,
                    'country_code': org.country_code,
                    'currency_code': org.default_currency,
                    'message': 'Connection successful'
                }
            else:
                return {
                    'success': False,
                    'error': 'No organisations found'
                }
                
        except ApiException as e:
            logger.error(f"Xero API error: {str(e)}")
            return {
                'success': False,
                'error': f'API Error: {str(e)}'
            }
        except Exception as e:
            logger.error(f"Connection test failed: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def sync_order(self, order_data: Dict[str, Any]) -> Dict[str, Any]:
        """Sync Dixis order to Xero as invoice"""
        try:
            logger.info(f"Starting order sync for order ID: {order_data.get('id')}")
            
            # Ensure customer exists
            customer_result = self._ensure_customer_exists(order_data['customer'])
            if not customer_result['success']:
                return customer_result
            
            # Create invoice
            invoice_result = self._create_invoice(order_data, customer_result['contact_id'])
            
            if invoice_result['success']:
                logger.info(f"Order {order_data.get('id')} synced successfully to Xero")
            
            return invoice_result
            
        except Exception as e:
            logger.error(f"Order sync failed: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def _ensure_customer_exists(self, customer_data: Dict[str, Any]) -> Dict[str, Any]:
        """Ensure customer exists in Xero, create if not"""
        try:
            # Check if customer already exists by email
            existing_contact = self._find_contact_by_email(customer_data['email'])
            
            if existing_contact:
                return {
                    'success': True,
                    'contact_id': existing_contact.contact_id,
                    'message': 'Customer already exists'
                }
            
            # Create new contact
            contact = Contact(
                name=customer_data['name'],
                email_address=customer_data['email'],
                first_name=customer_data.get('first_name', ''),
                last_name=customer_data.get('last_name', ''),
                addresses=[{
                    'address_type': 'STREET',
                    'address_line1': customer_data.get('address', ''),
                    'city': customer_data.get('city', ''),
                    'postal_code': customer_data.get('postal_code', ''),
                    'country': 'Greece'
                }],
                phones=[{
                    'phone_type': 'DEFAULT',
                    'phone_number': customer_data.get('phone', '')
                }] if customer_data.get('phone') else []
            )
            
            # Create contact in Xero
            contacts_response = self.accounting_api.create_contacts(
                self.config.tenant_id,
                contacts=[contact]
            )
            
            if contacts_response.contacts:
                created_contact = contacts_response.contacts[0]
                return {
                    'success': True,
                    'contact_id': created_contact.contact_id,
                    'message': 'Customer created successfully'
                }
            else:
                return {
                    'success': False,
                    'error': 'Failed to create customer'
                }
                
        except ApiException as e:
            logger.error(f"Customer creation failed: {str(e)}")
            return {
                'success': False,
                'error': f'API Error: {str(e)}'
            }
        except Exception as e:
            logger.error(f"Customer operation failed: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def _find_contact_by_email(self, email: str) -> Optional[Contact]:
        """Find contact by email address"""
        try:
            contacts_response = self.accounting_api.get_contacts(
                self.config.tenant_id,
                where=f'EmailAddress="{email}"'
            )
            
            if contacts_response.contacts:
                return contacts_response.contacts[0]
            return None
            
        except Exception as e:
            logger.error(f"Contact search failed: {str(e)}")
            return None
    
    def _create_invoice(self, order_data: Dict[str, Any], contact_id: str) -> Dict[str, Any]:
        """Create invoice in Xero from order data"""
        try:
            # Build line items
            line_items = []
            
            for item in order_data['items']:
                line_item = LineItem(
                    description=item['product_name'],
                    quantity=float(item['quantity']),
                    unit_amount=float(item['price']),
                    account_code="200",  # Sales account
                    tax_type="OUTPUT2" if order_data.get('include_tax', True) else "NONE"
                )
                line_items.append(line_item)
            
            # Add shipping if applicable
            if order_data.get('shipping_cost', 0) > 0:
                shipping_line = LineItem(
                    description="Shipping",
                    quantity=1.0,
                    unit_amount=float(order_data['shipping_cost']),
                    account_code="200",
                    tax_type="OUTPUT2" if order_data.get('include_tax', True) else "NONE"
                )
                line_items.append(shipping_line)
            
            # Create invoice
            invoice = Invoice(
                type="ACCREC",  # Accounts Receivable
                contact=Contact(contact_id=contact_id),
                line_items=line_items,
                date=datetime.fromisoformat(order_data['created_at'].replace('Z', '+00:00')).date(),
                due_date=datetime.fromisoformat(order_data.get('due_date', order_data['created_at']).replace('Z', '+00:00')).date(),
                invoice_number=order_data.get('invoice_number'),
                reference=f"Dixis Order #{order_data.get('order_number')}",
                status="DRAFT"  # Start as draft
            )
            
            # Create invoice in Xero
            invoices_response = self.accounting_api.create_invoices(
                self.config.tenant_id,
                invoices=Invoices(invoices=[invoice])
            )
            
            if invoices_response.invoices:
                created_invoice = invoices_response.invoices[0]
                return {
                    'success': True,
                    'invoice_id': created_invoice.invoice_id,
                    'invoice_number': created_invoice.invoice_number,
                    'total_amount': float(created_invoice.total),
                    'status': created_invoice.status,
                    'message': 'Invoice created successfully'
                }
            else:
                return {
                    'success': False,
                    'error': 'Failed to create invoice'
                }
                
        except ApiException as e:
            logger.error(f"Invoice creation failed: {str(e)}")
            return {
                'success': False,
                'error': f'API Error: {str(e)}'
            }
        except Exception as e:
            logger.error(f"Invoice creation failed: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_invoice_status(self, invoice_id: str) -> Dict[str, Any]:
        """Get invoice status from Xero"""
        try:
            invoice_response = self.accounting_api.get_invoice(
                self.config.tenant_id,
                invoice_id
            )
            
            if invoice_response.invoices:
                invoice = invoice_response.invoices[0]
                return {
                    'success': True,
                    'status': invoice.status,
                    'amount_due': float(invoice.amount_due or 0),
                    'amount_paid': float(invoice.amount_paid or 0),
                    'total': float(invoice.total or 0)
                }
            else:
                return {
                    'success': False,
                    'error': 'Invoice not found'
                }
                
        except Exception as e:
            logger.error(f"Failed to get invoice status: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }

def main():
    """Main entry point for the bridge service"""
    try:
        # Load configuration
        config = XeroConfig.from_env()
        
        # Validate configuration
        if not all([config.client_id, config.client_secret, config.tenant_id]):
            logger.error("Missing required Xero configuration")
            return {'success': False, 'error': 'Missing configuration'}
        
        # Initialize service
        service = XeroBridgeService(config)
        
        # Read operation from command line or stdin
        if len(sys.argv) > 1:
            operation = sys.argv[1]
            
            if operation == 'test':
                result = service.test_connection()
            elif operation == 'sync_order':
                # Read order data from stdin
                order_data = json.loads(sys.stdin.read())
                result = service.sync_order(order_data)
            elif operation == 'invoice_status':
                invoice_id = sys.argv[2] if len(sys.argv) > 2 else ''
                result = service.get_invoice_status(invoice_id)
            else:
                result = {'success': False, 'error': f'Unknown operation: {operation}'}
        else:
            # Default: read order data from stdin
            order_data = json.loads(sys.stdin.read())
            result = service.sync_order(order_data)
        
        # Output result as JSON
        print(json.dumps(result, indent=2))
        
        # Exit with appropriate code
        sys.exit(0 if result.get('success', False) else 1)
        
    except Exception as e:
        logger.error(f"Bridge service failed: {str(e)}")
        error_result = {'success': False, 'error': str(e)}
        print(json.dumps(error_result, indent=2))
        sys.exit(1)

if __name__ == '__main__':
    main()
```

### **2. Python Requirements File**

**requirements.txt:**
```txt
# Xero Python SDK
xero-python==6.1.0

# HTTP and OAuth2 dependencies
requests>=2.28.0
oauthlib>=3.2.0
requests-oauthlib>=1.3.0

# Data handling
python-dateutil>=2.8.0
pytz>=2022.1

# Logging and utilities
colorlog>=6.6.0
python-dotenv>=0.19.0

# Development dependencies (optional)
pytest>=7.0.0
pytest-cov>=4.0.0
black>=22.0.0
flake8>=5.0.0
```

### **3. Installation Script**

**install_xero_bridge.sh:**
```bash
#!/bin/bash
# Dixis Fresh - Xero Bridge Installation Script

set -e

echo "🐍 Installing Xero Integration Bridge..."

# Create virtual environment
python3 -m venv /opt/dixis/xero_bridge_env

# Activate virtual environment
source /opt/dixis/xero_bridge_env/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install requirements
pip install -r requirements.txt

# Create log directory
sudo mkdir -p /var/log/dixis
sudo chown www-data:www-data /var/log/dixis

# Make bridge script executable
chmod +x xero_bridge.py

# Create symlink for easy access
sudo ln -sf $(pwd)/xero_bridge.py /usr/local/bin/xero-bridge

echo "✅ Xero Bridge installed successfully!"
echo "📍 Bridge location: /usr/local/bin/xero-bridge"
echo "📁 Virtual env: /opt/dixis/xero_bridge_env"
echo "📝 Logs: /var/log/dixis/xero_bridge.log"
```

---

## ✅ **PART 1 COMPLETED**

**🎯 DELIVERED:**
- ✅ Complete Python Xero Bridge Service
- ✅ OAuth2 authentication με token management
- ✅ Order-to-invoice synchronization
- ✅ Customer creation και management
- ✅ Error handling και logging
- ✅ Installation script και requirements

**📁 FILES CREATED:**
- `xero_bridge.py` - Main Python service
- `requirements.txt` - Dependencies
- `install_xero_bridge.sh` - Installation script

**🔄 NEXT:** Part 2 - Laravel Integration Layer