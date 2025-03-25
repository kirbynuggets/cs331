import pandas as pd
from sqlalchemy import create_engine
from tqdm import tqdm

def import_csv():
    # Read the CSV file
    df = pd.read_csv("../../datasets/h_and_m/transactions_train.csv")
    
    # Create the database engine
    engine = create_engine("mysql+pymysql://fashion_user:securepass@localhost/fashion_db")
    
    # Calculate the total number of chunks
    chunksize = 10000  # Adjust this value based on your system's memory capacity
    total_chunks = len(df) // chunksize + (1 if len(df) % chunksize != 0 else 0)
    
    # Use tqdm to create a progress bar
    with tqdm(total=total_chunks, desc="Inserting data") as pbar:
        # Insert data in chunks
        for i in range(0, len(df), chunksize):
            chunk = df[i:i+chunksize]
            chunk.to_sql("h_and_m_transactions", engine, if_exists="append", index=False, method="multi")
            pbar.update(1)

if __name__ == "__main__":
    import_csv()
