import pandas as pd
from sqlalchemy import create_engine


def import_csv():
    df = pd.read_csv("../../datasets/styles_filtered.csv")
    engine = create_engine(
        "mysql+pymysql://fashion_user:securepass@localhost/fashion_db"
    )
    df.to_sql("clothing_items", engine, if_exists="replace", index=False)


if __name__ == "__main__":
    import_csv()
