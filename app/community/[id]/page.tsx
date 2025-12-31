"use client";


import { Metadata } from 'next';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { VibeDetailedCard } from '@/components/community/vibe-detailed-card';
import { CommentSection } from '@/components/community/comment-section';
import { getVibeById, getComments, toggleLike } from '@/lib/supabase';
import { createClient } from '@/utils/supabase/client';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;

    // Server-side fetch using direct supabase-js client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createSupabaseClient(supabaseUrl, supabaseKey);

    const { data: vibe } = await supabase
        .from('community_playlists')
        .select('emotion, tagline')
        .eq('id', id)
        .single();

    if (!vibe) {
        return {
            title: 'Vibe Not Found | MoodMate',
        };
    }

    return {
        title: `Feeling ${vibe.emotion} | MoodMate`,
        description: vibe.tagline || `Check out this ${vibe.emotion} playlist on MoodMate`,
        openGraph: {
            title: `Feeling ${vibe.emotion} on MoodMate`,
            description: vibe.tagline || `Check out this ${vibe.emotion} playlist`,
            images: [`/community/${id}/opengraph-image`],
        },
        twitter: {
            card: 'summary_large_image',
            title: `Feeling ${vibe.emotion} on MoodMate`,
            description: vibe.tagline || `Check out this ${vibe.emotion} playlist`,
            images: [`/community/${id}/opengraph-image`],
        }
    };
}

export default function VibeDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const supabase = createClient();

    const [vibe, setVibe] = useState<any>(null);
    const [comments, setComments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined);

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUserId(user?.id);
            if (id) {
                await fetchData(id, user?.id);
            }
        };
        init();
    }, [id]);

    const fetchData = async (playlistId: string, userId?: string) => {
        try {
            // Parallel Fetch
            const [vibeRes, commentsRes] = await Promise.all([
                getVibeById(playlistId, userId),
                getComments(playlistId)
            ]);

            if (vibeRes.error) throw vibeRes.error;
            if (commentsRes.error) throw commentsRes.error;

            setVibe(vibeRes.data);
            setComments(commentsRes.data || []);
        } catch (error) {
            console.error("Error fetching details:", error);
            toast.error("Failed to load vibe details.");
            router.push('/community');
        } finally {
            setLoading(false);
        }
    };

    const handleLikeToggle = async (playlistId: string, isLiked: boolean) => {
        if (!currentUserId) {
            toast.error("Please login to like!");
            return;
        }
        try {
            await toggleLike(currentUserId, playlistId);
        } catch (error) {
            console.error("Error toggling like:", error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-black/20" />
            </div>
        );
    }

    if (!vibe) return null;

    return (
        <main className="min-h-screen bg-[#FFF8F0] p-4 pt-24 md:p-8 md:pt-28 relative overflow-hidden">
            {/* Floating Background Effects */}
            <div className="absolute top-20 left-10 w-64 h-64 bg-[#FACC55] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob pointer-events-none" />
            <div className="absolute top-40 right-10 w-72 h-72 bg-[#A78BFA] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000 pointer-events-none" />

            <div className="max-w-4xl mx-auto relative z-10 space-y-8">
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 font-bold text-black/60 hover:text-black transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Feed
                </button>

                <div className="grid grid-cols-1 gap-12">
                    {/* Main Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <VibeDetailedCard
                            playlist={vibe}
                            currentUserId={currentUserId}
                            onLikeToggle={handleLikeToggle}
                        />
                    </motion.div>

                    {/* Comments Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-[40px] border border-black/5 p-8 shadow-sm"
                    >
                        <CommentSection
                            playlistId={id}
                            comments={comments}
                            currentUserId={currentUserId}
                            onCommentAdded={() => fetchData(id, currentUserId)}
                        />
                    </motion.div>
                </div>
            </div>
        </main>
    );
}
