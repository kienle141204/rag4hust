import win32com.client
import os 

def convert_doc_to_docx(input_path, output_path):
    word = win32com.client.Dispatch("Word.Application")
    try:
        doc = word.Documents.Open(input_path)
        doc.SaveAs(output_path, FileFormat=16) 
        doc.Close()
        os.remove(input_path)
    finally:
        word.Quit()

def main(directory: str):
    for filename in os.listdir(directory):
        if filename.endswith(".doc"):
            input_path = os.path.join(directory, filename)
            output_path = os.path.join(directory, filename.replace(".doc", ".docx"))
            convert_doc_to_docx(input_path, output_path)

if __name__ == '__main__':
    directory = 'E:\\chatbot\\data\\raw_data\\doc'
    main(directory)