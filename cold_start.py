import boto3
import time

client = boto3.client('lambda', region_name='ap-south-1')
fn = [f['FunctionName'] for f in client.list_functions()['Functions'] if 'DashboardFunction' in f['FunctionName']][0]

config = client.get_function_configuration(FunctionName=fn)
env = config.get('Environment', {}).get('Variables', {})
env['FORCE_COLD_START'] = str(time.time())
client.update_function_configuration(FunctionName=fn, Environment={'Variables': env})
print('Forced cold start on', fn)
