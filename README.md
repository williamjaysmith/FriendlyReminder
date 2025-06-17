# Friendly Reminder 📱

Your personal CRM to stay connected with the people you meet. A hybrid of a contact manager, Anki flashcards, and a personal assistant.

## 🚀 Features

### ✅ **Core Features (Implemented)**
- **Authentication System** - Email/password, Google, and GitHub login via Supabase
- **Smart Dashboard** - Overview of overdue contacts, upcoming reach-outs, and networking metrics
- **Contact Management** - Full CRUD operations for contacts with rich profiles
- **Smart Reminders** - Configurable reminder intervals with "Just Talked" functionality
- **Search & Filter** - Find contacts quickly by name, email, or description
- **Profile Settings** - Update username, email, password, and export data
- **Data Export** - Download all your contact data as JSON
- **Account Management** - Secure account deletion with confirmation

### 📋 **Contact Information Supported**
- Basic info (name, email, gender, birthday)
- Work details (company, position)
- Background (how you met, interests, notes)
- Reminder settings (custom intervals)
- Conversation tracking (last contact, next reminder)

### 🎯 **Smart Reminder Logic**
- Automatic reminder calculation based on last conversation + interval
- Overdue contact detection and highlighting
- "Just Talked" button to instantly reset reminder timers
- Upcoming reminders (next 7 days) tracking

## 🛠 Tech Stack

- **Frontend**: Next.js 15.3.3, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **Icons**: Lucide React
- **Deployment**: Vercel-ready

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd friendly-reminder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to Settings > API to get your project URL and anon key
   - Copy `.env.local.example` to `.env.local` and add your credentials:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

4. **Set up the database**
   - Open your Supabase project dashboard
   - Go to SQL Editor
   - Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
   - Click "Run" to create all tables, policies, and triggers

5. **Configure OAuth providers (optional)**
   - In Supabase dashboard, go to Authentication > Providers
   - Enable and configure Google and/or GitHub OAuth

6. **Start development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   - Navigate to `http://localhost:3000`
   - Create an account and start adding contacts!

## 🗄️ Database Schema

The app uses a PostgreSQL database with Row Level Security (RLS) enabled:

- **`profiles`** - User profiles linked to Supabase Auth
- **`contacts`** - Contact information with reminder logic
- **`tags`** - User-defined tags for organizing contacts (ready for future implementation)
- **`contact_tags`** - Many-to-many relationship for contact tagging
- **`social_links`** - Social media and website links per contact
- **`conversations`** - Conversation history with markdown support

## 🔐 Security

- Row Level Security (RLS) ensures users only access their own data
- Secure authentication with Supabase Auth
- Automatic profile creation on user signup
- Protected routes with middleware
- SQL injection prevention through Supabase client

## 🚀 Deployment

The app is ready for deployment on Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your environment variables in Vercel dashboard
4. Deploy!

## 🎨 UI/UX Features

- **Responsive Design** - Works seamlessly on desktop and mobile
- **Dark Mode Ready** - CSS variables prepared for theme switching
- **Accessible** - Proper ARIA labels and keyboard navigation
- **Toast Notifications** - User feedback for actions
- **Loading States** - Smooth UX with loading indicators
- **Error Handling** - Graceful error messages and recovery

## 📈 Future Enhancements

Ready-to-implement features:

- **Tag System** - Organize contacts by categories (design, music, sales, etc.)
- **Calendar Integration** - Google Calendar sync for meeting reminders
- **CSV Import** - Bulk import contacts from LinkedIn or other sources
- **Advanced Analytics** - Networking consistency graphs (GitHub-style)
- **Email/SMS Reminders** - Automated notifications via Supabase Edge Functions
- **Conversation Timeline** - Rich conversation history with markdown
- **Mobile App** - React Native version

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 💡 Inspiration

Built to solve the common problem of losing touch with valuable connections. Combines the spaced repetition concept from Anki with modern CRM practices to help you maintain meaningful relationships.

---

**Built with ❤️ using Next.js and Supabase**
