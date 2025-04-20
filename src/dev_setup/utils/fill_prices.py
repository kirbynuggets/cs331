import mysql.connector
import csv

def update_clothing_prices(mysql_config, csv_file):
    """
    Updates the 'price' column in the 'clothing_items' table with data from a CSV.

    Args:
        mysql_config (dict): MySQL connection configuration.
        csv_file (str): Path to the CSV file.
    """

    try:
        # Connect to MySQL
        mydb = mysql.connector.connect(**mysql_config)
        mycursor = mydb.cursor()

        # Read CSV data and update the database
        with open(csv_file, 'r') as file:
            csv_reader = csv.DictReader(file)
            for row in csv_reader:
                item_id = row['id']
                original_price = row['original_price']
                discounted_price = row['discounted_price']

                # Use the discounted price if available, otherwise use original price.
                # price = discounted_price if discounted_price else original_price
                price = original_price

                # Update the database
                sql = "UPDATE clothing_items SET price = %s WHERE id = %s"
                val = (price, item_id)
                mycursor.execute(sql, val)

        mydb.commit()  # Commit the changes
        print(mycursor.rowcount, "records updated.")

    except mysql.connector.Error as err:
        print(f"Error: {err}")

    except FileNotFoundError:
        print(f"Error: CSV file '{csv_file}' not found.")

    finally:
        if 'mydb' in locals() and mydb.is_connected():
            mycursor.close()
            mydb.close()
            print("MySQL connection closed.")

# Example usage:
mysql_config = {
    'host': 'localhost',
    'user': 'fashion_user',
    'password': 'securepass',
    'database': 'fashion_db',
}

csv_file_path = '../../datasets/pricing.csv' # Path to your csv file.

update_clothing_prices(mysql_config, csv_file_path)
