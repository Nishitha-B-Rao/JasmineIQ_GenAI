import pandas as pd
from google.cloud import bigquery
import os
from dotenv import load_dotenv

load_dotenv()

def setup():
    # Will use GOOGLE_CLOUD_PROJECT from env or default credentials
    try:
        client = bigquery.Client()
    except Exception as e:
        print("Please ensure you have authenticated with gcloud or set GOOGLE_CLOUD_PROJECT.")
        return

    dataset_id = f"{client.project}.jasmineiq"
    
    # Create dataset if not exists
    dataset = bigquery.Dataset(dataset_id)
    dataset.location = "US"
    try:
        client.create_dataset(dataset, timeout=30)
        print(f"Created dataset {dataset_id}")
    except Exception as e:
        print(f"Dataset {dataset_id} likely already exists. Proceeding...")
        
    csv_path = os.path.join(os.path.dirname(__file__), "data", "master_training_dataset.csv")
    if not os.path.exists(csv_path):
        print(f"Could not find {csv_path}")
        return
        
    df = pd.read_csv(csv_path)
    df["Date"] = pd.to_datetime(df["Date"])
    
    table_id = f"{dataset_id}.master_training_data"
    job_config = bigquery.LoadJobConfig(write_disposition="WRITE_TRUNCATE")
    
    print(f"Uploading data to {table_id}...")
    job = client.load_table_from_dataframe(df, table_id, job_config=job_config)
    job.result()
    
    print(f"Successfully loaded {job.output_rows} rows into {table_id}.")

if __name__ == "__main__":
    setup()
