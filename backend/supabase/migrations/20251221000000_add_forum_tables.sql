-- Migration: Add forum tables (questions, answers, reactions)

-- 1. Forum Questions Table
CREATE TABLE public.forum_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    is_resolved BOOLEAN DEFAULT false NOT NULL
);

ALTER TABLE public.forum_questions ENABLE ROW LEVEL SECURITY;

-- 2. Forum Answers Table
CREATE TABLE public.forum_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    question_id UUID REFERENCES public.forum_questions(id) ON DELETE CASCADE NOT NULL,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    is_best_answer BOOLEAN DEFAULT false NOT NULL
);

ALTER TABLE public.forum_answers ENABLE ROW LEVEL SECURITY;

-- 3. Forum Reactions Table (Stamps)
CREATE TABLE public.forum_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    target_type TEXT CHECK (target_type IN ('question', 'answer')) NOT NULL,
    target_id UUID NOT NULL,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    emoji TEXT NOT NULL,
    -- Ensure same user can't put same emoji on same target multiple times
    UNIQUE(target_id, profile_id, emoji)
);

ALTER TABLE public.forum_reactions ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies

-- Questions
CREATE POLICY "Anyone authenticated can view questions"
ON public.forum_questions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Anyone authenticated can create questions"
ON public.forum_questions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update their own questions"
ON public.forum_questions FOR UPDATE
TO authenticated
USING (auth.uid() = profile_id OR public.is_officer());

CREATE POLICY "Users can delete their own questions"
ON public.forum_questions FOR DELETE
TO authenticated
USING (auth.uid() = profile_id OR public.is_officer());

-- Answers
CREATE POLICY "Anyone authenticated can view answers"
ON public.forum_answers FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Anyone authenticated can create answers"
ON public.forum_answers FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update their own answers"
ON public.forum_answers FOR UPDATE
TO authenticated
USING (auth.uid() = profile_id OR public.is_officer());

CREATE POLICY "Users can delete their own answers"
ON public.forum_answers FOR DELETE
TO authenticated
USING (auth.uid() = profile_id OR public.is_officer());

-- Reactions
CREATE POLICY "Anyone authenticated can view reactions"
ON public.forum_reactions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Anyone authenticated can add reactions"
ON public.forum_reactions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can remove their own reactions"
ON public.forum_reactions FOR DELETE
TO authenticated
USING (auth.uid() = profile_id);

-- 5. Updated At Trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_forum_questions_updated
    BEFORE UPDATE ON public.forum_questions
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER on_forum_answers_updated
    BEFORE UPDATE ON public.forum_answers
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();
