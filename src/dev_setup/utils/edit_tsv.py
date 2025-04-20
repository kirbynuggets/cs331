""" Edit the original TSV file to have the desired format. """
with open("datasets/fashion_12k_en_de.tsv", "r", encoding="utf-8") as f:
    lines = f.readlines()[1:]

new_lines = ["img_id\ten_caption\n"]
for line in lines:
    line = line.strip()
    if line:
        line = line.replace("https://tlk.s3.yandex.net/Fashion-200K/", "")
        img_id, en_caption, de_caption = line.split("\t")
        img_id = img_id.replace(".jpeg", "")
        new_lines.append(f"{img_id}\t{en_caption}\n")


with open("datasets/fashion_data.tsv", "w", encoding="utf-8") as f:
    f.writelines(new_lines)
