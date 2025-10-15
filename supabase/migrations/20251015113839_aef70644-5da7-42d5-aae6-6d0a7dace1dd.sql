-- Create symptom_queries table to store user queries and AI responses
CREATE TABLE public.symptom_queries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  symptoms TEXT NOT NULL,
  analysis TEXT,
  severity TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.symptom_queries ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own symptom queries" 
ON public.symptom_queries 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own symptom queries" 
ON public.symptom_queries 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own symptom queries" 
ON public.symptom_queries 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for better query performance
CREATE INDEX idx_symptom_queries_user_id ON public.symptom_queries(user_id);
CREATE INDEX idx_symptom_queries_created_at ON public.symptom_queries(created_at DESC);