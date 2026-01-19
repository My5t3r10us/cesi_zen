import 'dotenv/config';
import { db } from './index';
import { emotionCategories, emotions, users } from './schema';
import { hashPassword } from '../auth/password';
import { eq } from 'drizzle-orm';

// Référentiel des catégories d'émotions (émotions de base)
const categories = [
  { label: 'Joie', colorHex: '#FFD700', iconName: 'smile' },
  { label: 'Colère', colorHex: '#FF6B6B', iconName: 'flame' },
  { label: 'Peur', colorHex: '#9370DB', iconName: 'alert-triangle' },
  { label: 'Tristesse', colorHex: '#6495ED', iconName: 'frown' },
  { label: 'Surprise', colorHex: '#FFA500', iconName: 'zap' },
  { label: 'Dégoût', colorHex: '#8B4513', iconName: 'thumbs-down' },
];

// Référentiel des émotions par catégorie
const emotionsByCategory: Record<string, string[]> = {
  'Joie': ['Fierté', 'Contentement', 'Enchantement', 'Excitation', 'Émerveillement', 'Gratitude'],
  'Colère': ['Frustration', 'Irritation', 'Rage', 'Ressentiment', 'Agacement', 'Hostilité'],
  'Peur': ['Inquiétude', 'Anxiété', 'Terreur', 'Appréhension', 'Panique', 'Crainte'],
  'Tristesse': ['Chagrin', 'Mélancolie', 'Abattement', 'Désespoir', 'Solitude', 'Dépression'],
  'Surprise': ['Étonnement', 'Stupéfaction', 'Sidération', 'Incrédulité', 'Émerveillement', 'Confusion'],
  'Dégoût': ['Répulsion', 'Déplaisir', 'Nausée', 'Dédain', 'Horreur', 'Dégoût profond'],
};

async function seed() {
  console.log('🌱 Seeding database...');

  // Seed categories
  console.log('📂 Seeding emotion categories...');
  for (const category of categories) {
    await db.insert(emotionCategories).values(category).onConflictDoNothing();
  }
  console.log(`✅ ${categories.length} categories seeded`);

  // Seed emotions
  console.log('📊 Seeding emotions...');
  let emotionCount = 0;
  for (const [categoryLabel, emotionLabels] of Object.entries(emotionsByCategory)) {
    const category = await db.query.emotionCategories.findFirst({
      where: eq(emotionCategories.label, categoryLabel),
    });
    
    if (category) {
      for (const label of emotionLabels) {
        await db.insert(emotions).values({
          label,
          categoryId: category.id,
        }).onConflictDoNothing();
        emotionCount++;
      }
    }
  }
  console.log(`✅ ${emotionCount} emotions seeded`);

  // Seed admin user
  console.log('👤 Creating admin user...');
  const adminEmail = 'admin@cesizen.fr';
  const adminPassword = hashPassword('Admin123!');
  
  await db.insert(users).values({
    email: adminEmail,
    passwordHash: adminPassword,
    nom: 'Admin',
    prenom: 'CESIZen',
    role: 'admin',
  }).onConflictDoNothing();
  
  console.log(`✅ Admin user created: ${adminEmail}`);
  console.log('🎉 Seeding complete!');
}

seed()
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
