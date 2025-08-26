const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

// Simple migration system
class MigrationRunner {
  constructor() {
    this.migrations = [
      {
        name: "create-users-collection",
        up: this.createUsersCollection.bind(this),
        down: this.dropUsersCollection.bind(this),
      },
      {
        name: "create-products-collection",
        up: this.createProductsCollection.bind(this),
        down: this.dropProductsCollection.bind(this),
      },
    ];
  }

  async createUsersCollection() {
    const db = mongoose.connection.db;

    // Create users collection
    await db.createCollection("users");

    // Create indexes
    await db.collection("users").createIndex({ email: 1 }, { unique: true });
    await db.collection("users").createIndex({ username: 1 }, { unique: true });

    // Create an admin user (optional)
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await db.collection("users").insertOne({
      username: "admin",
      email: "admin@example.com",
      password: hashedPassword,
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log("Users collection created successfully");
  }

  async dropUsersCollection() {
    const db = mongoose.connection.db;
    await db.collection("users").drop();
    console.log("Users collection dropped successfully");
  }

  async createProductsCollection() {
    const db = mongoose.connection.db;

    // Create products collection
    await db.createCollection("products");

    // Create indexes
    await db.collection("products").createIndex({ name: 1 });
    await db.collection("products").createIndex({ category: 1 });
    await db.collection("products").createIndex({ price: 1 });

    // Insert some sample products
    await db.collection("products").insertMany([
      {
        name: "Sample Product 1",
        description: "This is a sample product",
        price: 29.99,
        category: "electronics",
        inStock: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Sample Product 2",
        description: "Another sample product",
        price: 49.99,
        category: "clothing",
        inStock: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    console.log("Products collection created successfully");
  }

  async dropProductsCollection() {
    const db = mongoose.connection.db;
    await db.collection("products").drop();
    console.log("Products collection dropped successfully");
  }

  async ensureMigrationsCollection() {
    const db = mongoose.connection.db;
    try {
      await db.createCollection("migrations");
    } catch (err) {
      // Collection already exists, which is fine
    }
    return db.collection("migrations");
  }

  async run() {
    const command = process.argv[2];
    const migrationsCollection = await this.ensureMigrationsCollection();

    try {
      switch (command) {
        case "up":
          for (const migration of this.migrations) {
            const applied = await migrationsCollection.findOne({
              name: migration.name,
            });
            if (!applied) {
              console.log(`Applying migration: ${migration.name}`);
              await migration.up();
              await migrationsCollection.insertOne({
                name: migration.name,
                appliedAt: new Date(),
              });
            }
          }
          console.log("All migrations applied successfully");
          break;

        case "down":
          // Get all applied migrations in reverse order
          const appliedMigrations = await migrationsCollection
            .find()
            .sort({ appliedAt: -1 })
            .toArray();
          if (appliedMigrations.length > 0) {
            const lastMigration = appliedMigrations[0];
            const migration = this.migrations.find(
              (m) => m.name === lastMigration.name
            );
            if (migration) {
              console.log(`Reverting migration: ${migration.name}`);
              await migration.down();
              await migrationsCollection.deleteOne({ name: migration.name });
              console.log("Migration reverted successfully");
            }
          } else {
            console.log("No migrations to revert");
          }
          break;

        case "list":
          const migrations = await migrationsCollection
            .find()
            .sort({ appliedAt: 1 })
            .toArray();
          console.log("Applied migrations:");
          migrations.forEach((m) =>
            console.log(`- ${m.name} (applied at ${m.appliedAt})`)
          );
          break;

        default:
          console.log("Usage: node migrations/runMigrations.js [up|down|list]");
          console.log("Available migrations:");
          this.migrations.forEach((m) => console.log(`- ${m.name}`));
          break;
      }
    } catch (error) {
      console.error("Migration error:", error);
      process.exit(1);
    } finally {
      await mongoose.disconnect();
    }
  }
}

// Connect to MongoDB and run migrations
mongoose
  .connect(
    process.env.MONGODB_URI ,
    {
      
    }
  )
  .then(async () => {
    console.log("Connected to MongoDB");
    const runner = new MigrationRunner();
    await runner.run();
  })
  .catch((err) => {
    console.error("Database connection error:", err);
    process.exit(1);
  });
