import os
import requests
import json
import time

class TLE:
	def __init__(self, name, norad_id, tle):
		self.name = name
		self.norad_id = norad_id
		self.tle = tle

def get_tle(url, output_file_path=None):
	tle_objects = []

	res = requests.get(url)
	if res.status_code != 200:
		print("Error:", res)
		return tle_objects

	lines = res.text.strip().split('\n')

	for i in range(0, len(lines), 3):
		name = lines[i].strip()
		line1 = lines[i + 1].strip()
		line2 = lines[i + 2].strip()
		norad_id = line1.split()[1].strip('U')

		tle_objects.append(TLE(name, norad_id, [line1, line2]))
	
	if output_file_path:
		tle_dict = {tle.norad_id: {"tle": tle.tle} for tle in tle_objects}
		try:
			with open(output_file_path, 'w') as file:
				json.dump(tle_dict, file, indent=2)
				print(f"TLE data saved to {output_file_path}")
		except Exception as e:
			print(f"Failed to write to file: {e}")
	
	return tle_objects

def main():
	url = "https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=tle"
	project_dir = os.path.dirname(os.path.abspath(__file__))
	output_dir = os.path.join(project_dir, "var/tmp/tle")

	if not os.path.exists(output_dir):
		print(f"Creating directory {output_dir}\n")
		os.makedirs(output_dir, exist_ok=True)

	output_file_path = os.path.join(output_dir, "tle.json")

	start_time = time.time()
	tle_objects = get_tle(url, output_file_path)
	print(f"Read Time: {(time.time() - start_time):.2f} seconds")

if __name__ == "__main__":
	main()