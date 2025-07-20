'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { emailService } from '@/lib/services/emailService';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/utils/errorUtils';

interface EmailTestPanelProps {
  className?: string;
}

export default function EmailTestPanel({ className = '' }: EmailTestPanelProps) {
  const [testing, setTesting] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const [testOrderId, setTestOrderId] = useState<string>('');

  const handleTestEmail = async () => {
    try {
      setTesting(true);
      const result = await emailService.testEmailConfiguration();
      
      if (result.success) {
        toast.success('Email configuration test passed!');
      } else {
        toast.error(`Email test failed: ${result.message}`);
      }
    } catch (error) {
      toast.error(`Email test error: ${getErrorMessage(error)}`);
    } finally {
      setTesting(false);
    }
  };

  const handlePreviewEmail = async () => {
    if (!testOrderId) {
      toast.error('Please enter an order ID');
      return;
    }

    try {
      setPreviewLoading(true);
      const html = await emailService.generateEmailPreview(parseInt(testOrderId));
      setPreviewHtml(html);
      setShowPreview(true);
    } catch (error) {
      toast.error(`Preview error: ${getErrorMessage(error)}`);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!testOrderId) {
      toast.error('Please enter an order ID');
      return;
    }

    try {
      const result = await emailService.sendOrderConfirmation(parseInt(testOrderId));
      if (result.success) {
        toast.success('Email sent successfully!');
      } else {
        toast.error(`Failed to send email: ${result.message}`);
      }
    } catch (error) {
      toast.error(`Send error: ${getErrorMessage(error)}`);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>"⚙"</span>
            <span>Email System Testing</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Email Configuration Test */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Email Configuration Test</h4>
              <p className="text-sm text-gray-600">
                Test if email system is properly configured
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleTestEmail}
              disabled={testing}
              className="flex items-center space-x-2"
            >
              {testing ? <span>"⟳"</span> : <span>"▶"</span>}
              <span>{testing ? 'Testing...' : 'Test Email'}</span>
            </Button>
          </div>

          {/* Order Email Testing */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <h4 className="font-medium text-gray-900">Order Email Testing</h4>
            
            <div className="flex space-x-2">
              <input
                type="number"
                placeholder="Enter Order ID"
                value={testOrderId}
                onChange={(e) => setTestOrderId(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button
                variant="outline"
                onClick={handlePreviewEmail}
                disabled={previewLoading || !testOrderId}
                className="flex items-center space-x-1"
              >
                {previewLoading ? <span>"⟳"</span> : <span>"👁"</span>}
                <span>Preview</span>
              </Button>
              <Button
                variant="primary"
                onClick={handleResendEmail}
                disabled={!testOrderId}
                className="flex items-center space-x-1"
              >
                <span>📧</span>
                <span>Send</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Preview Modal */}
      {showPreview && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowPreview(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-medium">Email Preview</h3>
              <Button
                variant="ghost"
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </Button>
            </div>
            
            <div className="p-4 overflow-auto max-h-[70vh]">
              {previewHtml ? (
                <div 
                  className="border border-gray-200 rounded"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No preview available
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Email Templates Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span className="text-green-500">📧</span>
            <span>Available Email Templates</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <h4 className="font-medium text-green-800">Order Confirmation</h4>
                <p className="text-sm text-green-600">
                  Sent automatically when order is created
                </p>
              </div>
              <div className="flex items-center space-x-1 text-green-600">
                <span>"✓"</span>
                <span className="text-sm">Active</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <h4 className="font-medium text-blue-800">Order Shipped</h4>
                <p className="text-sm text-blue-600">
                  Sent when order status changes to 'shipped'
                </p>
              </div>
              <div className="flex items-center space-x-1 text-blue-600">
                <span>"✓"</span>
                <span className="text-sm">Active</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div>
                <h4 className="font-medium text-yellow-800">Order Status Updates</h4>
                <p className="text-sm text-yellow-600">
                  Sent for significant status changes
                </p>
              </div>
              <div className="flex items-center space-x-1 text-yellow-600">
                <span>"✓"</span>
                <span className="text-sm">Active</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div>
                <h4 className="font-medium text-purple-800">Producer Notifications</h4>
                <p className="text-sm text-purple-600">
                  Sent to producers when they receive new orders
                </p>
              </div>
              <div className="flex items-center space-x-1 text-purple-600">
                <span>"✓"</span>
                <span className="text-sm">Active</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>"✓"</span>
            <span>Email System Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-800">Backend Integration</h4>
              <p className="text-sm text-green-600">✅ Laravel email system active</p>
            </div>
            
            <div className="p-3 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-800">Event Listeners</h4>
              <p className="text-sm text-green-600">✅ OrderCreated event configured</p>
            </div>
            
            <div className="p-3 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-800">Queue System</h4>
              <p className="text-sm text-green-600">✅ Async email processing</p>
            </div>
            
            <div className="p-3 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-800">Templates</h4>
              <p className="text-sm text-green-600">✅ Professional HTML templates</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
