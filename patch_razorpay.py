import os

razorpay_path = '/usr/local/lib/python3.12/site-packages/razorpay/client.py'

with open(razorpay_path, 'r') as f:
    content = f.read()

content = content.replace('import pkg_resources', 'import importlib.metadata')
content = content.replace('from pkg_resources import DistributionNotFound', 'from importlib.metadata import PackageNotFoundError as DistributionNotFound')
content = content.replace('pkg_resources.get_distribution', 'importlib.metadata.version')
content = content.replace('pkg_resources.require', '# pkg_resources.require')

with open(razorpay_path, 'w') as f:
    f.write(content)

print('razorpay patched successfully')
