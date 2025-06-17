-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (extends auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create contacts table
CREATE TABLE public.contacts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    gender TEXT,
    birthday DATE,
    description TEXT,
    work_company TEXT,
    work_position TEXT,
    how_we_met TEXT,
    interests TEXT,
    last_conversation TIMESTAMP WITH TIME ZONE,
    reminder_days INTEGER DEFAULT 30 NOT NULL,
    next_reminder TIMESTAMP WITH TIME ZONE,
    birthday_reminder BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create tags table
CREATE TABLE public.tags (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    color TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, name)
);

-- Create contact_tags junction table
CREATE TABLE public.contact_tags (
    contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
    PRIMARY KEY (contact_id, tag_id)
);

-- Create social_links table
CREATE TABLE public.social_links (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE NOT NULL,
    platform TEXT NOT NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create conversations table
CREATE TABLE public.conversations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE NOT NULL,
    notes TEXT NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, username)
    VALUES (new.id, new.email, new.raw_user_meta_data->>'username');
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create function to update next_reminder when last_conversation is updated
CREATE OR REPLACE FUNCTION public.update_next_reminder()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.last_conversation IS NOT NULL AND NEW.last_conversation != OLD.last_conversation THEN
        NEW.next_reminder = NEW.last_conversation + INTERVAL '1 day' * NEW.reminder_days;
    END IF;
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating next_reminder
CREATE TRIGGER on_contact_updated
    BEFORE UPDATE ON public.contacts
    FOR EACH ROW EXECUTE PROCEDURE public.update_next_reminder();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- Set up Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Create policies for contacts
CREATE POLICY "Users can view own contacts" ON public.contacts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own contacts" ON public.contacts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own contacts" ON public.contacts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own contacts" ON public.contacts
    FOR DELETE USING (auth.uid() = user_id);

-- Create policies for tags
CREATE POLICY "Users can view own tags" ON public.tags
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tags" ON public.tags
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tags" ON public.tags
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tags" ON public.tags
    FOR DELETE USING (auth.uid() = user_id);

-- Create policies for contact_tags
CREATE POLICY "Users can view own contact tags" ON public.contact_tags
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.contacts 
            WHERE contacts.id = contact_tags.contact_id 
            AND contacts.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own contact tags" ON public.contact_tags
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.contacts 
            WHERE contacts.id = contact_tags.contact_id 
            AND contacts.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own contact tags" ON public.contact_tags
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.contacts 
            WHERE contacts.id = contact_tags.contact_id 
            AND contacts.user_id = auth.uid()
        )
    );

-- Create policies for social_links
CREATE POLICY "Users can view own contact social links" ON public.social_links
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.contacts 
            WHERE contacts.id = social_links.contact_id 
            AND contacts.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own contact social links" ON public.social_links
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.contacts 
            WHERE contacts.id = social_links.contact_id 
            AND contacts.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own contact social links" ON public.social_links
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.contacts 
            WHERE contacts.id = social_links.contact_id 
            AND contacts.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own contact social links" ON public.social_links
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.contacts 
            WHERE contacts.id = social_links.contact_id 
            AND contacts.user_id = auth.uid()
        )
    );

-- Create policies for conversations
CREATE POLICY "Users can view own contact conversations" ON public.conversations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.contacts 
            WHERE contacts.id = conversations.contact_id 
            AND contacts.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own contact conversations" ON public.conversations
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.contacts 
            WHERE contacts.id = conversations.contact_id 
            AND contacts.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own contact conversations" ON public.conversations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.contacts 
            WHERE contacts.id = conversations.contact_id 
            AND contacts.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own contact conversations" ON public.conversations
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.contacts 
            WHERE contacts.id = conversations.contact_id 
            AND contacts.user_id = auth.uid()
        )
    );