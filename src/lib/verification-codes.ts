import { writeFile, readFile, unlink } from 'fs/promises';
import { join } from 'path';

interface VerificationData {
    code: string;
    expires: number;
}

// 임시 파일 경로
const getFilePath = (email: string) => join(process.cwd(), 'temp', `verification_${email.replace('@', '_at_').replace('.', '_dot_')}.json`);

// 6자리 랜덤 인증번호 생성
export function generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// 인증번호 저장
export async function saveVerificationCode(email: string, code: string, expiresAt: number): Promise<void> {
    try {
        const data: VerificationData = { code, expires: expiresAt };
        const filePath = getFilePath(email);

        // temp 디렉토리가 없으면 생성
        const { mkdir } = await import('fs/promises');
        await mkdir(join(process.cwd(), 'temp'), { recursive: true });

        await writeFile(filePath, JSON.stringify(data), 'utf8');
    } catch (error) {
        throw error;
    }
}

// 인증번호 조회
export async function getVerificationCode(email: string): Promise<VerificationData | null> {
    try {
        const filePath = getFilePath(email);
        const data = await readFile(filePath, 'utf8');
        const verificationData: VerificationData = JSON.parse(data);

        return verificationData;
    } catch {
        return null;
    }
}

// 인증번호 삭제
export async function deleteVerificationCode(email: string): Promise<void> {
    try {
        const filePath = getFilePath(email);
        await unlink(filePath);
    } catch (error) {
    }
}