-- Migration: Fix forum_reactions relationships by adding explicit FKs

-- 1. Drop the old polymorphic table
DROP TABLE IF EXISTS public.forum_reactions;

-- 2. Create the improved table with explicit foreign keys
CREATE TABLE public.forum_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    question_id UUID REFERENCES public.forum_questions(id) ON DELETE CASCADE,
    answer_id UUID REFERENCES public.forum_answers(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    emoji TEXT NOT NULL,
    -- Ensure it points to exactly one target
    CONSTRAINT one_target_check CHECK (
        (question_id IS NOT NULL AND answer_id IS NULL) OR
        (question_id IS NULL AND answer_id IS NOT NULL)
    ),
    -- Prevent duplicate reactions from same user
    UNIQUE(question_id, answer_id, profile_id, emoji)
);

ALTER TABLE public.forum_reactions ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
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
