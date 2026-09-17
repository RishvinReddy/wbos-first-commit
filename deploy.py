import boto3
import zipfile
import os

def zip_dir(dir_path, zip_path):
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(dir_path):
            for file in files:
                if file.endswith('.py') or file.endswith('.json'):
                    file_path = os.path.join(root, file)
                    arcname = os.path.relpath(file_path, dir_path)
                    zipf.write(file_path, arcname)

zip_dir('src', 'deploy.zip')
client = boto3.client('lambda', region_name='ap-south-1')
functions = client.list_functions()['Functions']
dash_fn = [f['FunctionName'] for f in functions if 'DashboardFunction' in f['FunctionName']][0]
ingress_fn = [f['FunctionName'] for f in functions if 'IngressFunction' in f['FunctionName']][0]

with open('deploy.zip', 'rb') as f:
    zip_bytes = f.read()

client.update_function_code(FunctionName=dash_fn, ZipFile=zip_bytes)
client.update_function_code(FunctionName=ingress_fn, ZipFile=zip_bytes)
print(f'Updated {dash_fn} and {ingress_fn}')
