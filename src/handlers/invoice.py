import os
import json
import logging
import boto3
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from core import events

logger = logging.getLogger()
logger.setLevel(logging.INFO)

s3_client = boto3.client('s3')

def generate_pdf(invoice_data: dict, output_path: str):
    """
    Generates a basic PDF invoice using ReportLab.
    """
    c = canvas.Canvas(output_path, pagesize=letter)
    width, height = letter

    # Header
    c.setFont("Helvetica-Bold", 24)
    c.drawString(50, height - 50, "WBOS Store Invoice")

    c.setFont("Helvetica", 12)
    c.drawString(50, height - 80, f"Order ID: {invoice_data.get('orderId')}")
    c.drawString(50, height - 100, f"Customer: {invoice_data.get('customerId')}")

    # Line Items
    y = height - 140
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y, "Item")
    c.drawString(300, y, "Qty")
    c.drawString(400, y, "Total")

    y -= 20
    c.setFont("Helvetica", 12)
    for item in invoice_data.get("items", []):
        c.drawString(50, y, str(item.get("name", "Unknown Item")))
        c.drawString(300, y, str(item.get("quantity", 0)))
        c.drawString(400, y, f"${item.get('lineTotal', 0.0):.2f}")
        y -= 20

    y -= 20
    c.setFont("Helvetica-Bold", 14)
    c.drawString(300, y, "Total:")
    c.drawString(400, y, f"${invoice_data.get('total', 0.0):.2f}")

    c.save()

def lambda_handler(event, context):
    """
    Handles EventBridge OrderCreated event.
    Generates an invoice PDF and uploads it to S3, then emits InvoiceGenerated.
    """
    logger.info(f"Received event: {json.dumps(event)}")

    # Extract data from EventBridge envelope
    detail = event.get("detail", {})
    order_data = detail.get("data", {})
    tenant_id = detail.get("tenantId", "TENANT_001")
    order_id = order_data.get("orderId")

    if not order_id:
        logger.error("No orderId found in event")
        return {"status": "error", "message": "Missing orderId"}

    bucket_name = os.environ.get("INVOICE_BUCKET")
    pdf_filename = f"invoice_{order_id}.pdf"
    local_pdf_path = f"/tmp/{pdf_filename}"

    # 1. Generate PDF
    generate_pdf(order_data, local_pdf_path)

    # 2. Upload to S3
    s3_key = f"{tenant_id}/invoices/{pdf_filename}"
    try:
        s3_client.upload_file(local_pdf_path, bucket_name, s3_key)
        logger.info(f"Successfully uploaded invoice to s3://{bucket_name}/{s3_key}")
    except Exception as e:
        logger.error(f"Failed to upload invoice to S3: {e}")
        raise e

    # Generate a pre-signed URL or direct URL if public (For MVP we assume presigned URL is fine)
    # Using a fake URL format for the mock environment unless generating a real presigned URL
    invoice_url = f"https://{bucket_name}.s3.amazonaws.com/{s3_key}"

    # 3. Emit InvoiceGenerated Event
    events.publish(
        event_type="InvoiceGenerated",
        tenant_id=tenant_id,
        source="wbos.invoice",
        data={
            "orderId": order_id,
            "invoiceUrl": invoice_url
        }
    )

    return {"status": "success", "invoiceUrl": invoice_url}
