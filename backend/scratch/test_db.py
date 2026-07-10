import asyncio
import asyncpg

async def test_passwords():
    passwords = ["postgres", "", "1234", "123456", "root", "admin", "password", "admin123"]
    for p in passwords:
        print(f"Trying password: '{p}'...")
        try:
            conn = await asyncpg.connect(
                user='postgres',
                password=p,
                database='postgres',
                host='localhost'
            )
            print(f"SUCCESS! Connected with password: '{p}'")
            await conn.close()
            return p
        except asyncpg.exceptions.InvalidPasswordError:
            print("  Failed: Invalid password")
        except Exception as e:
            print("  Failed with other error:", e)
            # If database 'postgres' does not exist, let's try other database or check if pg is running
            if "database" in str(e):
                print(f"SUCCESS! Connected but db not found with password: '{p}'")
                return p
    print("None of the common passwords worked.")
    return None

if __name__ == "__main__":
    asyncio.run(test_passwords())
