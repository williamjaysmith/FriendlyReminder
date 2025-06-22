#!/usr/bin/env node

const { Client, Databases, Account } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

const client = new Client();
client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY); // You'll need to add this to .env.local

const databases = new Databases(client);

const DATABASE_ID = 'friendly-reminder-db';

const collections = [
  {
    id: 'profiles',
    name: 'Profiles',
    attributes: [
      { key: 'user_id', type: 'string', size: 255, required: true },
      { key: 'username', type: 'string', size: 255, required: false },
      { key: 'email', type: 'string', size: 255, required: false }
    ],
    indexes: [
      { key: 'user_id_index', type: 'key', attributes: ['user_id'] }
    ]
  },
  {
    id: 'contacts',
    name: 'Contacts',
    attributes: [
      { key: 'user_id', type: 'string', size: 255, required: true },
      { key: 'name', type: 'string', size: 255, required: true },
      { key: 'email', type: 'string', size: 255, required: false },
      { key: 'gender', type: 'string', size: 50, required: false },
      { key: 'birthday', type: 'string', size: 10, required: false },
      { key: 'description', type: 'string', size: 1000, required: false },
      { key: 'work_company', type: 'string', size: 255, required: false },
      { key: 'work_position', type: 'string', size: 255, required: false },
      { key: 'how_we_met', type: 'string', size: 500, required: false },
      { key: 'interests', type: 'string', size: 500, required: false },
      { key: 'last_conversation', type: 'string', size: 10, required: false },
      { key: 'reminder_days', type: 'integer', required: true, default: 30 },
      { key: 'next_reminder', type: 'string', size: 10, required: false },
      { key: 'birthday_reminder', type: 'boolean', required: true, default: false },
      { key: 'email_reminders', type: 'boolean', required: true, default: false }
    ],
    indexes: [
      { key: 'user_id_index', type: 'key', attributes: ['user_id'] },
      { key: 'next_reminder_index', type: 'key', attributes: ['next_reminder'] }
    ]
  },
  {
    id: 'tags',
    name: 'Tags',
    attributes: [
      { key: 'user_id', type: 'string', size: 255, required: true },
      { key: 'name', type: 'string', size: 100, required: true },
      { key: 'color', type: 'string', size: 7, required: false }
    ],
    indexes: [
      { key: 'user_id_index', type: 'key', attributes: ['user_id'] }
    ]
  },
  {
    id: 'contact_tags',
    name: 'Contact Tags',
    attributes: [
      { key: 'contact_id', type: 'string', size: 255, required: true },
      { key: 'tag_id', type: 'string', size: 255, required: true }
    ],
    indexes: [
      { key: 'contact_id_index', type: 'key', attributes: ['contact_id'] },
      { key: 'tag_id_index', type: 'key', attributes: ['tag_id'] }
    ]
  },
  {
    id: 'social_links',
    name: 'Social Links',
    attributes: [
      { key: 'contact_id', type: 'string', size: 255, required: true },
      { key: 'platform', type: 'string', size: 50, required: true },
      { key: 'url', type: 'string', size: 500, required: true }
    ],
    indexes: [
      { key: 'contact_id_index', type: 'key', attributes: ['contact_id'] }
    ]
  },
  {
    id: 'conversations',
    name: 'Conversations',
    attributes: [
      { key: 'contact_id', type: 'string', size: 255, required: true },
      { key: 'notes', type: 'string', size: 5000, required: true },
      { key: 'date', type: 'string', size: 10, required: true }
    ],
    indexes: [
      { key: 'contact_id_index', type: 'key', attributes: ['contact_id'] },
      { key: 'date_index', type: 'key', attributes: ['date'] }
    ]
  }
];

async function setupDatabase() {
  console.log('🚀 Setting up Appwrite database...');
  
  try {
    // Create database
    console.log('📁 Creating database...');
    await databases.create(DATABASE_ID, 'Friendly Reminder Database');
    console.log('✅ Database created successfully');
  } catch (error) {
    if (error.code === 409) {
      console.log('📁 Database already exists, continuing...');
    } else {
      throw error;
    }
  }

  // Create collections
  for (const collection of collections) {
    try {
      console.log(`📋 Creating collection: ${collection.name}...`);
      
      // Create collection
      await databases.createCollection(
        DATABASE_ID,
        collection.id,
        collection.name
      );
      
      console.log(`✅ Collection ${collection.name} created`);
      
      // Add attributes
      for (const attr of collection.attributes) {
        console.log(`  ➕ Adding attribute: ${attr.key}`);
        
        if (attr.type === 'string') {
          await databases.createStringAttribute(
            DATABASE_ID,
            collection.id,
            attr.key,
            attr.size,
            attr.required,
            attr.default || undefined
          );
        } else if (attr.type === 'integer') {
          await databases.createIntegerAttribute(
            DATABASE_ID,
            collection.id,
            attr.key,
            attr.required,
            undefined, // min
            undefined, // max  
            attr.default || undefined
          );
        } else if (attr.type === 'boolean') {
          await databases.createBooleanAttribute(
            DATABASE_ID,
            collection.id,
            attr.key,
            attr.required,
            attr.default || undefined
          );
        }
        
        // Wait a bit between attribute creation
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Wait for attributes to be ready before creating indexes
      console.log(`  ⏳ Waiting for attributes to be ready...`);
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Add indexes
      for (const index of collection.indexes) {
        console.log(`  🔍 Creating index: ${index.key}`);
        await databases.createIndex(
          DATABASE_ID,
          collection.id,
          index.key,
          index.type,
          index.attributes
        );
      }
      
      console.log(`✅ Collection ${collection.name} setup complete`);
      
    } catch (error) {
      if (error.code === 409) {
        console.log(`📋 Collection ${collection.name} already exists, skipping...`);
      } else {
        console.error(`❌ Error creating collection ${collection.name}:`, error.message);
      }
    }
  }
  
  console.log('🎉 Database setup complete!');
  console.log('\n📋 Next steps:');
  console.log('1. Set collection permissions in Appwrite console');
  console.log('2. Configure OAuth providers');
  console.log('3. Test your application with: npm run dev');
}

async function main() {
  if (!process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID) {
    console.error('❌ NEXT_PUBLIC_APPWRITE_PROJECT_ID not found in .env.local');
    process.exit(1);
  }
  
  if (!process.env.APPWRITE_API_KEY) {
    console.error('❌ APPWRITE_API_KEY not found in .env.local');
    console.log('💡 Get your API key from Appwrite Console > Settings > API Keys');
    console.log('💡 Add it to .env.local as: APPWRITE_API_KEY=your_api_key_here');
    process.exit(1);
  }

  await setupDatabase();
}

if (require.main === module) {
  main().catch(error => {
    console.error('💥 Setup failed:', error.message);
    process.exit(1);
  });
}