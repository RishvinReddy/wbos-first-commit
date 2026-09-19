import os
import re

page_path = 'dashboard/src/app/automations/builder/[id]/page.tsx'
client_path = 'dashboard/src/app/automations/builder/[id]/client.tsx'

with open(page_path, 'r') as f:
    content = f.read()

# Modify content for client.tsx
client_content = re.sub(r'export async function generateStaticParams\(\) \{\n  return \[\];\n\}\n\n', '', content)
client_content = client_content.replace('export default function AutomationBuilder({ params }: { params: { id: string } })', 'export default function AutomationBuilder({ id }: { id: string })')
client_content = client_content.replace('params.id', 'id')

with open(client_path, 'w') as f:
    f.write(client_content)

# Write new page.tsx
page_content = """import ClientBuilder from "./client";

export async function generateStaticParams() {
  return [];
}

export default function Page({ params }: { params: { id: string } }) {
  return <ClientBuilder id={params.id} />;
}
"""

with open(page_path, 'w') as f:
    f.write(page_content)

print('Success')
