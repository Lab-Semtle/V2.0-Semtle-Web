import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트 (서비스 역할)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
    try {
        const { userId, profileData } = await request.json();

        if (!userId || !profileData) {
            return NextResponse.json(
                { error: '사용자 ID와 프로필 데이터가 필요합니다.' },
                { status: 400 }
            );
        }

        // 기존 프로필 확인 (중복 생성 방지)
        const { data: existingProfile } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('id', userId)
            .single();

        if (existingProfile) {
            console.log('Profile already exists for user:', userId);
            return NextResponse.json({
                success: true,
                message: '프로필이 이미 존재합니다.',
            });
        }

        // 사용자 프로필 생성 데이터 준비
        const profileInsertData = {
            id: userId,
            student_id: profileData.student_id || '',
            nickname: profileData.nickname || '',
            name: profileData.name || '',
            email: profileData.email,
            birth_date: profileData.birth_date || null,
            major: profileData.major || '',
            grade: profileData.grade || null,
            status: true, // 첫 회원가입 시 활성 상태
            email_verified: false, // 이메일 인증 전까지는 false
            role: 'member', // 기본 역할
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        console.log('🔧 프로필 생성 데이터:', profileInsertData);

        // 사용자 프로필 생성 (외래 키 제약 조건 없이)
        const { data: insertData, error: profileError } = await supabase
            .from('user_profiles')
            .insert(profileInsertData)
            .select();

        console.log('📝 프로필 생성 결과:', { insertData, profileError });

        if (profileError) {
            console.error('Error creating user profile:', profileError);
            return NextResponse.json(
                { error: profileError.message || '프로필 생성 중 오류가 발생했습니다.' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: '사용자 프로필이 생성되었습니다.',
        });

    } catch (error) {
        console.error('Create user profile error:', error);
        return NextResponse.json(
            { error: '서버 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
