// Database Seeding Script
// Run: node seed.mjs

import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

mongoose.set('bufferTimeoutMS', 60000);

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI, {
    tls: true,
    tlsAllowInvalidCertificates: true,
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 60000,
  });
  console.log('MongoDB Connected');
};

const seedData = async () => {
  await connectDB();
  
  // Define User model inside function to ensure connection is ready
  const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['provider', 'seeker'], required: true },
    profile: {
      firstName: String, lastName: String, companyName: String,
      avatar: String, bio: String, location: String, website: String, linkedin: String
    },
    providerDetails: {
      skills: [String], services: [{ name: String, price: Number, description: String }],
      monthlyRevenue: Number, clientsDelivered: Number, experience: Number,
      certifications: [String], availability: String
    },
    seekerDetails: {
      industry: String, businessType: String, monthlyRevenue: Number,
      painPoints: [String], budget: Number, lookingFor: String, teamSize: Number
    },
    stats: { views: Number, connections: Number, messages: Number },
    isVerified: Boolean, lastActive: Date
  }, { timestamps: true });

  userSchema.pre('save', async function() {
    if (this.isModified('password')) {
      this.password = await bcrypt.hash(this.password, 12);
    }
  });

  const User = mongoose.model('User', userSchema);
  
  try {
    // Clear existing data
    await User.deleteMany({});
    console.log('✓ Cleared existing users\n');

    // SERVICE PROVIDERS (Web Devs, Marketers, SEO experts)
    const providers = [
      {
        email: 'alex@webdevpro.com',
        password: 'password123',
        role: 'provider',
        profile: { firstName: 'Alex', lastName: 'Chen', companyName: 'WebDevPro', bio: 'Full-stack developer with 8 years experience. I build fast, beautiful websites that convert visitors into customers.', location: 'San Francisco, CA', website: 'https://webdevpro.com', linkedin: 'linkedin.com/in/alexchen' },
        providerDetails: {
          skills: ['Web Design', 'React', 'Node.js', 'SEO', 'E-commerce'],
          services: [
            { name: 'Website Design & Development', price: 2500, description: 'Custom responsive website with SEO optimization' },
            { name: 'E-commerce Store', price: 4000, description: 'Full online store with payment processing' },
            { name: 'SEO Optimization', price: 800, description: 'Technical SEO audit and implementation' }
          ],
          monthlyRevenue: 15000, clientsDelivered: 45, experience: 8,
          certifications: ['Google Certified', 'Meta Certified'], availability: 'open'
        },
        stats: { views: 234, connections: 12, messages: 45 },
        isVerified: true, lastActive: new Date()
      },
      {
        email: 'sarah@seomaster.com',
        password: 'password123',
        role: 'provider',
        profile: { firstName: 'Sarah', lastName: 'Johnson', companyName: 'SEOMaster Agency', bio: 'I help small businesses rank #1 on Google. No fluff, just results. If you want more leads, I can help.', location: 'Austin, TX', website: 'https://seomaster.com', linkedin: 'linkedin.com/in/sarahseo' },
        providerDetails: {
          skills: ['SEO', 'Google Ads', 'Facebook Ads', 'Analytics', 'Content Marketing'],
          services: [
            { name: 'SEO Campaign', price: 1500, description: 'Monthly SEO to rank on page 1' },
            { name: 'Google Ads Management', price: 500, description: 'Setup and manage PPC campaigns' },
            { name: 'Analytics Setup', price: 300, description: 'Complete analytics with conversion tracking' }
          ],
          monthlyRevenue: 12000, clientsDelivered: 38, experience: 6,
          certifications: ['Google Ads Certified', 'HubSpot Certified'], availability: 'open'
        },
        stats: { views: 189, connections: 8, messages: 32 },
        isVerified: true, lastActive: new Date()
      },
      {
        email: 'mike@growthhacker.com',
        password: 'password123',
        role: 'provider',
        profile: { firstName: 'Mike', lastName: 'Rodriguez', companyName: 'GrowthHacker Marketing', bio: 'Growth marketer specializing in SaaS and B2B. I help companies scale from 0 to $1M ARR.', location: 'New York, NY', website: 'https://growthhacker.com', linkedin: 'linkedin.com/in/mikegrowth' },
        providerDetails: {
          skills: ['Growth Marketing', 'SaaS Marketing', 'B2B Marketing', 'Email Marketing', 'Copywriting'],
          services: [
            { name: 'Growth Strategy', price: 3000, description: 'Comprehensive growth roadmap' },
            { name: 'Email Marketing', price: 800, description: 'Automated email sequences that convert' },
            { name: 'Marketing Audit', price: 500, description: 'Review your current marketing and find gaps' }
          ],
          monthlyRevenue: 18000, clientsDelivered: 25, experience: 5,
          certifications: ['HubSpot Partner', 'Klaviyo Certified'], availability: 'limited'
        },
        stats: { views: 156, connections: 6, messages: 18 },
        isVerified: true, lastActive: new Date()
      },
      {
        email: 'emma@designstudio.com',
        password: 'password123',
        role: 'provider',
        profile: { firstName: 'Emma', lastName: 'Wilson', companyName: 'DesignStudio', bio: 'Award-winning designer specializing in brand identity and UI/UX. Your brand deserves to look amazing.', location: 'Los Angeles, CA', website: 'https://emmawilson.design', linkedin: 'linkedin.com/in/emmawilson' },
        providerDetails: {
          skills: ['Brand Design', 'UI/UX Design', 'Logo Design', 'Web Design', 'Figma'],
          services: [
            { name: 'Brand Identity', price: 2000, description: 'Complete brand package with logo, colors, typography' },
            { name: 'Website Design', price: 1500, description: 'Professional website design in Figma' },
            { name: 'Logo Design', price: 500, description: 'Memorable logo with brand guidelines' }
          ],
          monthlyRevenue: 8000, clientsDelivered: 52, experience: 7,
          certifications: ['Adobe Certified'], availability: 'open'
        },
        stats: { views: 203, connections: 15, messages: 38 },
        isVerified: true, lastActive: new Date()
      }
    ];

    // BUSINESS OWNERS (Seeking marketing help)
    const seekers = [
      {
        email: 'john@localrestaurant.com',
        password: 'password123',
        role: 'seeker',
        profile: { firstName: 'John', lastName: 'Martinez', companyName: 'Taco Loco Restaurant', bio: 'Family-owned Mexican restaurant for 15 years. We need help getting more customers through the door.', location: 'Phoenix, AZ', website: 'https://tacoloco.com' },
        seekerDetails: {
          industry: 'Restaurant', businessType: 'Local Restaurant', monthlyRevenue: 25000,
          painPoints: ['Marketing Overwhelm', 'Need More Clients', 'Social Media Management'],
          budget: 1500, lookingFor: 'partnership', teamSize: 8
        },
        stats: { views: 45, connections: 2, messages: 5 },
        isVerified: false, lastActive: new Date()
      },
      {
        email: 'lisa@dentaloffice.com',
        password: 'password123',
        role: 'seeker',
        profile: { firstName: 'Lisa', lastName: 'Thompson', companyName: 'Bright Smile Dental', bio: 'Dental practice for 10 years. Losing patients to chains with big marketing budgets. Need someone to handle all our marketing.', location: 'Chicago, IL', website: 'https://brightsmiledental.com' },
        seekerDetails: {
          industry: 'Healthcare', businessType: 'Dental Practice', monthlyRevenue: 45000,
          painPoints: ['Marketing Overwhelm', 'No Time for Sales', 'Need More Clients', 'Content Creation'],
          budget: 2500, lookingFor: 'partnership', teamSize: 5
        },
        stats: { views: 67, connections: 3, messages: 8 },
        isVerified: false, lastActive: new Date()
      },
      {
        email: 'robert@contractor.com',
        password: 'password123',
        role: 'seeker',
        profile: { firstName: 'Robert', lastName: 'Brown', companyName: 'Brown Construction LLC', bio: 'Residential contractor doing great work but struggling to get leads. Need marketing help so I can focus on building.', location: 'Denver, CO', website: 'https://brownconstruction.com' },
        seekerDetails: {
          industry: 'Construction', businessType: 'Contractor', monthlyRevenue: 35000,
          painPoints: ['Need More Clients', 'No Time for Sales', 'Limited Budget'],
          budget: 1000, lookingFor: 'freelancer', teamSize: 4
        },
        stats: { views: 34, connections: 1, messages: 3 },
        isVerified: false, lastActive: new Date()
      },
      {
        email: 'amanda@boutique.com',
        password: 'password123',
        role: 'seeker',
        profile: { firstName: 'Amanda', lastName: 'Lee', companyName: 'Velvet Vintage Boutique', bio: 'Curated vintage clothing boutique. Great products but need help with online presence and sales.', location: 'Portland, OR', website: 'https://velvetvintage.com' },
        seekerDetails: {
          industry: 'Retail', businessType: 'Online Boutique', monthlyRevenue: 18000,
          painPoints: ['Social Media Management', 'Need More Clients', 'Content Creation', 'Email Marketing'],
          budget: 800, lookingFor: 'partnership', teamSize: 2
        },
        stats: { views: 89, connections: 4, messages: 12 },
        isVerified: false, lastActive: new Date()
      },
      {
        email: 'david@techstartup.com',
        password: 'password123',
        role: 'seeker',
        profile: { firstName: 'David', lastName: 'Park', companyName: 'TechStart SaaS', bio: 'B2B SaaS startup looking for help with growth marketing. Have product, need customers.', location: 'Seattle, WA', website: 'https://techstartsaas.com' },
        seekerDetails: {
          industry: 'SaaS', businessType: 'SaaS Startup', monthlyRevenue: 8000,
          painPoints: ['Need More Clients', 'Growth Marketing', 'Content Marketing', 'No Technical Skills'],
          budget: 3000, lookingFor: 'partnership', teamSize: 3
        },
        stats: { views: 112, connections: 5, messages: 15 },
        isVerified: false, lastActive: new Date()
      },
      {
        email: 'maria@realtor.com',
        password: 'password123',
        role: 'seeker',
        profile: { firstName: 'Maria', lastName: 'Garcia', companyName: 'Garcia Real Estate', bio: 'Top-producing real estate agent. Need consistent leads for listings and buyers.', location: 'Miami, FL', website: 'https://garciarealestate.com' },
        seekerDetails: {
          industry: 'Real Estate', businessType: 'Real Estate Agent', monthlyRevenue: 75000,
          painPoints: ['Need More Clients', 'Marketing Overwhelm', 'No Time for Sales'],
          budget: 2000, lookingFor: 'partnership', teamSize: 1
        },
        stats: { views: 78, connections: 3, messages: 9 },
        isVerified: false, lastActive: new Date()
      }
    ];

    // Insert all users
    const allUsers = [...providers, ...seekers];
    
    for (const userData of allUsers) {
      const user = new User(userData);
      await user.save();
      console.log(`✓ Created: ${userData.email} (${userData.role})`);
    }

    console.log('\n=== Seed Complete ===');
    console.log(`Total users: ${allUsers.length}`);
    console.log(`Providers: ${providers.length}`);
    console.log(`Seekers: ${seekers.length}`);
    
    console.log('\n=== Login Credentials ===');
    console.log('\nProviders (use password: password123):');
    providers.forEach(p => console.log(`  - ${p.email}`));
    
    console.log('\nSeekers (use password: password123):');
    seekers.forEach(s => console.log(`  - ${s.email}`));

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error.message);
    process.exit(1);
  }
};

seedData();