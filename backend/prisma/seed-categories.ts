import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
    {
        name: 'Project Showcase',
        slug: 'project-showcase',
        description: 'Share your completed projects and builds',
        icon: '🚀',
        color: '#3B82F6', // Blue
    },
    {
        name: 'Ideas & Brainstorm',
        slug: 'ideas-brainstorm',
        description: 'Discuss ideas, concepts, and future possibilities',
        icon: '💡',
        color: '#F59E0B', // Amber
    },
    {
        name: 'Learning Journey',
        slug: 'learning-journey',
        description: 'Share what you learned and your progress',
        icon: '🎓',
        color: '#8B5CF6', // Purple
    },
    {
        name: 'Collaboration',
        slug: 'collaboration',
        description: 'Looking for team members or project partners',
        icon: '🤝',
        color: '#10B981', // Green
    },
    {
        name: 'Opportunities',
        slug: 'opportunities',
        description: 'Jobs, internships, bounties, and freelance work',
        icon: '💼',
        color: '#EF4444', // Red
    },
    {
        name: 'Resource Share',
        slug: 'resource-share',
        description: 'Useful tools, libraries, tutorials, and resources',
        icon: '📚',
        color: '#06B6D4', // Cyan
    },
    {
        name: 'Achievement',
        slug: 'achievement',
        description: 'Celebrate your wins and milestones',
        icon: '🏆',
        color: '#F97316', // Orange
    },
    {
        name: 'Research & Innovation',
        slug: 'research-innovation',
        description: 'Exploring new technologies and research topics',
        icon: '🔬',
        color: '#EC4899', // Pink
    },
    {
        name: 'Question & Discussion',
        slug: 'question-discussion',
        description: 'Ask questions and seek advice from the community',
        icon: '❓',
        color: '#6366F1', // Indigo
    },
    {
        name: 'Announcement',
        slug: 'announcement',
        description: 'Important updates and news',
        icon: '📢',
        color: '#14B8A6', // Teal
    },
];

async function seedCategories() {
    console.log('🌱 Seeding categories...');

    try {
        // Delete existing categories (if any)
        await prisma.category.deleteMany();
        console.log('✅ Cleared existing categories');

        // Create new categories
        for (const category of categories) {
            await prisma.category.create({
                data: category,
            });
            console.log(`✅ Created category: ${category.name}`);
        }

        console.log('\n🎉 Successfully seeded 10 categories!');
    } catch (error) {
        console.error('❌ Error seeding categories:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

seedCategories()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
