from setuptools import setup, find_packages

with open("requirements.txt") as f:
	install_requires = f.read().strip().split("\n")

# get version from __version__ variable in nacoc/__init__.py
from nacoc import __version__ as version

setup(
	name="nacoc",
	version=version,
	description="NACOC Apps",
	author="NACOC",
	author_email="social@ncc.gov.gh",
	packages=find_packages(),
	zip_safe=False,
	include_package_data=True,
	install_requires=install_requires
)
