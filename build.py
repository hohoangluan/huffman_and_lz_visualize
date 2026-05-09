import os

def build():
    print("Building compression_demo.html...")
    
    with open("src/template.html", "r", encoding="utf-8") as f:
        template = f.read()
        
    js_files = ["icons.js", "huffman.js", "lz77.js", "lz78.js", "lzw.js", "main.js"]
    js_content = ""
    
    for js_file in js_files:
        path = os.path.join("src", js_file)
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                js_content += f"\n\n// --- {js_file} ---\n\n"
                js_content += f.read()
        else:
            print(f"Warning: {path} not found.")
            
    output = template.replace("<!-- INJECT_JS -->", js_content)
    
    with open("compression_demo.html", "w", encoding="utf-8") as f:
        f.write(output)
        
    print("Done! Generated compression_demo.html")

if __name__ == "__main__":
    build()
