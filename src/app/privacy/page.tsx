'use client';

import { ArrowLeft, Shield, Calendar, FileText, AlertTriangle, Users, Database, Eye, Trash2, Phone, Mail } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
                {/* 헤더 */}
                <div className="mb-12">
                    <Link
                        href="/"
                        className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200 mb-6 group"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
                        홈으로 돌아가기
                    </Link>

                    <div className="flex items-center space-x-4 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">개인정보 처리방침</h1>
                            <p className="text-gray-600 mt-1">개인정보 보호 및 처리에 관한 사항</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4" />
                            <span>시행일: 2025년 03월 01일</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <FileText className="w-4 h-4" />
                            <span>개인정보 보호법 제30조 준수</span>
                        </div>
                    </div>
                </div>

                {/* 개인정보 처리방침 내용 */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="p-8 space-y-8">

                        {/* 서문 */}
                        <section className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-100">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                                    <Shield className="w-4 h-4 text-white" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">개인정보 보호 원칙</h2>
                            </div>
                            <p className="text-gray-700 leading-relaxed">
                                아치셈틀(이하 '학회'라 한다)은 개인정보 보호법 제30조에 따라 정보 주체의 개인정보를 보호하고, 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 다음과 같이 개인정보 처리방침을 수립하여 공개합니다.
                            </p>
                        </section>

                        {/* 제1조 */}
                        <section className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <span className="text-blue-600 font-bold text-sm">1</span>
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">개인정보의 처리목적</h2>
                            </div>
                            <div className="pl-11">
                                <p className="text-gray-700 leading-relaxed mb-4">
                                    학회는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 개인정보 보호법 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
                                </p>

                                <div className="space-y-6">
                                    {/* 1. 홈페이지 회원 가입 및 관리 */}
                                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                                        <h3 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                                            <Users className="w-4 h-4 text-blue-600" />
                                            <span>1. 홈페이지 회원 가입 및 관리</span>
                                        </h3>
                                        <ul className="space-y-1 text-sm text-gray-700">
                                            <li className="flex items-start space-x-2">
                                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                                <span>회원 가입 의사 확인, 회원제 서비스 제공을 위한 본인 식별·인증, 회원 자격 유지·관리</span>
                                            </li>
                                            <li className="flex items-start space-x-2">
                                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                                <span>서비스 부정 이용 방지, 학회원 공지·안내, 학회 내부 운영을 위한 학회원 관리</span>
                                            </li>
                                        </ul>
                                    </div>

                                    {/* 2. 학회 활동 및 행사 운영 */}
                                    <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                                        <h3 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                                            <Calendar className="w-4 h-4 text-purple-600" />
                                            <span>2. 학회 활동 및 행사 운영</span>
                                        </h3>
                                        <ul className="space-y-1 text-sm text-gray-700">
                                            <li className="flex items-start space-x-2">
                                                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                                                <span>학회 주관 세미나, 프로젝트, 연구 활동, 행사 참여 신청 및 관리</span>
                                            </li>
                                            <li className="flex items-start space-x-2">
                                                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                                                <span>학회원의 행사 참석 이력 및 활동 내역 관리</span>
                                            </li>
                                        </ul>
                                    </div>

                                    {/* 3. 학회원 정보 제공 */}
                                    <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                                        <h3 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                                            <Database className="w-4 h-4 text-orange-600" />
                                            <span>3. 학회원 정보 제공 (필수 사항)</span>
                                        </h3>
                                        <p className="text-sm text-gray-700">
                                            학회원의 정보를 <strong className="text-gray-900">한국해양대학교 인공지능공학부 학과 사무실</strong>에 제공하여 학회원 관리에 활용
                                        </p>
                                    </div>

                                    {/* 4. 학회원 간 네트워킹 */}
                                    <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
                                        <h3 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                                            <Users className="w-4 h-4 text-emerald-600" />
                                            <span>4. 학회원 간 네트워킹 및 교류</span>
                                        </h3>
                                        <p className="text-sm text-gray-700">
                                            학회원 간 정보 공유 및 커뮤니케이션 지원
                                        </p>
                                    </div>

                                    {/* 5. 제휴 및 외부 기관 연계 */}
                                    <div className="bg-teal-50 rounded-lg p-4 border border-teal-100">
                                        <h3 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                                            <Shield className="w-4 h-4 text-teal-600" />
                                            <span>5. 제휴 및 외부 기관 연계 (선택 사항)</span>
                                        </h3>
                                        <p className="text-sm text-gray-700">
                                            학회는 타 학회·동아리, 기업, 클라우드 서비스 제공 업체와의 협력을 위해 정보 주체의 동의하에 개인정보를 제공할 수 있음
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 제2조 */}
                        <section className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <span className="text-purple-600 font-bold text-sm">2</span>
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">개인정보의 처리 및 보유기간</h2>
                            </div>
                            <div className="pl-11">
                                <div className="space-y-4">
                                    <p className="text-gray-700 leading-relaxed">
                                        <span className="font-semibold text-gray-900">1.</span> 학회는 법령에 따른 개인정보 보유·이용 기간 또는 정보 주체로부터 동의 받은 개인정보 보유·이용 기간 내에서 개인정보를 처리·보유합니다.
                                    </p>
                                    <p className="text-gray-700 leading-relaxed">
                                        <span className="font-semibold text-gray-900">2.</span> 각각의 개인정보 처리 및 보유 기간은 다음과 같습니다.
                                    </p>

                                    <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                                        <h3 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                                            <Calendar className="w-4 h-4 text-purple-600" />
                                            <span>홈페이지 회원 가입 및 관리</span>
                                        </h3>
                                        <ul className="space-y-2 text-sm text-gray-700">
                                            <li className="flex items-start space-x-2">
                                                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                                                <span>회원 탈퇴 시까지</span>
                                            </li>
                                            <li className="flex items-start space-x-2">
                                                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                                                <span>단, 다음의 경우에는 해당 사유 종료 시까지 보관할 수 있음</span>
                                            </li>
                                            <div className="ml-4 space-y-1">
                                                <div className="flex items-start space-x-2">
                                                    <div className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                                                    <span className="text-xs text-gray-600">관계 법령 위반에 따른 수사·조사 진행 중인 경우: 해당 수사·조사 종료 시까지</span>
                                                </div>
                                                <div className="flex items-start space-x-2">
                                                    <div className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                                                    <span className="text-xs text-gray-600">홈페이지 이용에 따른 채권·채무관계 잔존 시: 해당 채권·채무 관계 정산 시까지</span>
                                                </div>
                                            </div>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 제3조 */}
                        <section className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                                    <span className="text-emerald-600 font-bold text-sm">3</span>
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">개인정보의 제3자 제공</h2>
                            </div>
                            <div className="pl-11">
                                <div className="space-y-3">
                                    <p className="text-gray-700 leading-relaxed">
                                        <span className="font-semibold text-gray-900">1.</span> 학회는 정보 주체의 개인정보를 <strong className="text-gray-900">제1조(개인정보의 처리목적)</strong>에서 명시한 범위 내에서만 처리하며, 원칙적으로 정보 주체의 동의 없이 제3자에게 제공하지 않습니다.
                                    </p>
                                    <p className="text-gray-700 leading-relaxed">
                                        <span className="font-semibold text-gray-900">2.</span> 단, 다음의 경우 정보 주체의 동의를 받아 최소한의 개인정보를 제3자에게 제공할 수 있습니다.
                                    </p>
                                    <div className="ml-4 space-y-1">
                                        <div className="flex items-start space-x-2">
                                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                                            <span className="text-gray-600 text-sm">타 학회·동아리, 기업, 클라우드 서비스 제공 업체와 협력하는 경우</span>
                                        </div>
                                    </div>
                                    <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
                                        <div className="flex items-start space-x-2">
                                            <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                                            <p className="text-orange-800 text-sm">
                                                <span className="font-semibold text-gray-900">3.</span> 학회원 정보는 <strong className="text-gray-900">한국해양대학교 인공지능공학부 학과 사무실에 필수적으로 제공되며, 학회원 관리 목적으로 활용됩니다.</strong>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 제4조 */}
                        <section className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                    <span className="text-orange-600 font-bold text-sm">4</span>
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">개인정보처리의 위탁</h2>
                            </div>
                            <div className="pl-11">
                                <div className="space-y-3">
                                    <p className="text-gray-700 leading-relaxed">
                                        <span className="font-semibold text-gray-900">1.</span> 학회는 원활한 서비스 제공을 위하여 <strong className="text-gray-900">개인정보 처리를 외부에 위탁하지 않습니다.</strong>
                                    </p>
                                    <p className="text-gray-700 leading-relaxed">
                                        <span className="font-semibold text-gray-900">2.</span> 향후 위탁이 필요한 경우, 정보 주체의 동의를 받아 개인정보 보호법 제25조에 따라 안전하게 관리될 수 있도록 조치할 것입니다.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* 제5조 */}
                        <section className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                                    <span className="text-red-600 font-bold text-sm">5</span>
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">정보 주체 및 법정대리인의 권리와 행사 방법</h2>
                            </div>
                            <div className="pl-11">
                                <div className="space-y-3">
                                    <p className="text-gray-700 leading-relaxed">
                                        <span className="font-semibold text-gray-900">1.</span> 정보 주체는 학회에 대해 언제든지 다음의 개인정보 보호 관련 권리를 행사할 수 있습니다.
                                    </p>
                                    <div className="ml-4 space-y-2">
                                        <div className="flex items-start space-x-2">
                                            <Eye className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-600 text-sm">개인정보 열람 요구</span>
                                        </div>
                                        <div className="flex items-start space-x-2">
                                            <FileText className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-600 text-sm">오류 정정 요구</span>
                                        </div>
                                        <div className="flex items-start space-x-2">
                                            <Trash2 className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-600 text-sm">삭제 요구</span>
                                        </div>
                                        <div className="flex items-start space-x-2">
                                            <Shield className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-600 text-sm">처리 정지 요구</span>
                                        </div>
                                    </div>
                                    <p className="text-gray-700 leading-relaxed">
                                        <span className="font-semibold text-gray-900">2.</span> 요청은 서면, 전화, 이메일 등을 통해 할 수 있으며, 학회는 이에 대해 지체 없이 조치하겠습니다.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* 제6조 */}
                        <section className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                                    <span className="text-indigo-600 font-bold text-sm">6</span>
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">처리하는 개인정보 항목</h2>
                            </div>
                            <div className="pl-11">
                                <p className="text-gray-700 leading-relaxed mb-4">
                                    학회는 다음의 개인정보 항목을 처리합니다.
                                </p>

                                <div className="space-y-4">
                                    {/* 홈페이지 회원 가입 및 관리 */}
                                    <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                                        <h3 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                                            <Users className="w-4 h-4 text-indigo-600" />
                                            <span>1. 홈페이지 회원 가입 및 관리</span>
                                        </h3>
                                        <div className="space-y-2">
                                            <div>
                                                <span className="text-sm font-medium text-gray-700">필수항목:</span>
                                                <span className="text-sm text-gray-600 ml-2">학번, 비밀번호, 이메일, 성명, 연락처</span>
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium text-gray-700">선택항목:</span>
                                                <span className="text-sm text-gray-600 ml-2">생년월일, 프로필 이미지</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 학회 활동 및 행사 운영 */}
                                    <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                                        <h3 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                                            <Calendar className="w-4 h-4 text-purple-600" />
                                            <span>2. 학회 활동 및 행사 운영</span>
                                        </h3>
                                        <div>
                                            <span className="text-sm font-medium text-gray-700">필수항목:</span>
                                            <span className="text-sm text-gray-600 ml-2">성명, 학번(또는 신분증 대체번호), 이메일, 연락처</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 제7조 */}
                        <section className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                                    <span className="text-teal-600 font-bold text-sm">7</span>
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">개인정보의 파기</h2>
                            </div>
                            <div className="pl-11">
                                <div className="space-y-3">
                                    <p className="text-gray-700 leading-relaxed">
                                        <span className="font-semibold text-gray-900">1.</span> 학회는 개인정보 보유 기간이 경과하거나 처리 목적이 달성되었을 때, 지체 없이 해당 개인정보를 파기합니다.
                                    </p>
                                    <p className="text-gray-700 leading-relaxed">
                                        <span className="font-semibold text-gray-900">2.</span> 개인정보 파기의 절차 및 방법은 다음과 같습니다.
                                    </p>

                                    <div className="space-y-4">
                                        <div className="bg-teal-50 rounded-lg p-4 border border-teal-100">
                                            <h3 className="font-semibold text-gray-900 mb-2">파기 절차</h3>
                                            <p className="text-sm text-gray-700">
                                                학회는 파기 사유가 발생한 개인정보를 선정하고, 개인정보 보호 책임자의 승인을 받아 개인정보를 파기합니다.
                                            </p>
                                        </div>

                                        <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                                            <h3 className="font-semibold text-gray-900 mb-2">파기 방법</h3>
                                            <p className="text-sm text-gray-700">
                                                전자적 파일 형태의 개인정보는 복구할 수 없도록 영구 삭제하며, 종이 문서에 기록된 개인정보는 분쇄 또는 소각 처리합니다.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 제8조 */}
                        <section className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                                    <span className="text-pink-600 font-bold text-sm">8</span>
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">개인정보 보호책임자</h2>
                            </div>
                            <div className="pl-11">
                                <p className="text-gray-700 leading-relaxed mb-4">
                                    학회는 개인정보 보호를 위해 다음과 같이 개인정보 보호책임자를 지정하고 있습니다.
                                </p>

                                <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg p-6 border border-pink-100">
                                    <h3 className="font-bold text-gray-900 mb-4 flex items-center space-x-2">
                                        <Shield className="w-5 h-5 text-pink-600" />
                                        <span>개인정보 보호책임자</span>
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center space-x-2">
                                            <Users className="w-4 h-4 text-pink-500" />
                                            <span><strong className="text-gray-900">성명:</strong> 이상영</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <FileText className="w-4 h-4 text-pink-500" />
                                            <span><strong className="text-gray-900">직책:</strong> 학회회장</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Phone className="w-4 h-4 text-pink-500" />
                                            <span><strong className="text-gray-900">연락처:</strong> (추후 업데이트 예정)</span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-700 mt-4">
                                        정보 주체께서는 학회의 서비스 이용 중 발생한 개인정보 보호 관련 문의를 개인정보 보호책임자에게 요청하실 수 있으며, 학회는 이에 대해 신속하게 답변 및 조치를 취할 것입니다.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* 제9조 */}
                        <section className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center">
                                    <span className="text-cyan-600 font-bold text-sm">9</span>
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">개인정보 열람청구</h2>
                            </div>
                            <div className="pl-11">
                                <p className="text-gray-700 leading-relaxed">
                                    정보 주체는 개인정보 보호법 제35조에 따른 개인정보 열람을 요청할 수 있으며, 학회는 이를 신속히 처리하겠습니다.
                                </p>
                            </div>
                        </section>

                        {/* 제10조 */}
                        <section className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-lime-100 rounded-lg flex items-center justify-center">
                                    <span className="text-lime-600 font-bold text-sm">10</span>
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">권익침해 구제 방법</h2>
                            </div>
                            <div className="pl-11">
                                <p className="text-gray-700 leading-relaxed mb-4">
                                    정보 주체는 개인정보 침해와 관련하여 아래 기관에 상담 및 신고를 할 수 있습니다.
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-lime-50 rounded-lg p-4 border border-lime-100">
                                        <h3 className="font-semibold text-gray-900 mb-2">개인정보 분쟁조정위원회</h3>
                                        <div className="flex items-center space-x-2 text-sm text-gray-700">
                                            <Phone className="w-4 h-4 text-lime-600" />
                                            <span>1833-6972</span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                                            <span>https://www.kopico.go.kr</span>
                                        </div>
                                    </div>

                                    <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                                        <h3 className="font-semibold text-gray-900 mb-2">개인정보침해신고센터</h3>
                                        <div className="flex items-center space-x-2 text-sm text-gray-700">
                                            <Phone className="w-4 h-4 text-orange-600" />
                                            <span>118</span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                                            <span>https://privacy.kisa.or.kr</span>
                                        </div>
                                    </div>

                                    <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                                        <h3 className="font-semibold text-gray-900 mb-2">대검찰청</h3>
                                        <div className="flex items-center space-x-2 text-sm text-gray-700">
                                            <Phone className="w-4 h-4 text-red-600" />
                                            <span>1301</span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                                            <span>https://www.spo.go.kr</span>
                                        </div>
                                    </div>

                                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                                        <h3 className="font-semibold text-gray-900 mb-2">경찰청 사이버수사국</h3>
                                        <div className="flex items-center space-x-2 text-sm text-gray-700">
                                            <Phone className="w-4 h-4 text-blue-600" />
                                            <span>182</span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                                            <span>https://ecrm.police.go.kr/minwon/main</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 제11조 */}
                        <section className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
                                    <span className="text-violet-600 font-bold text-sm">11</span>
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">개인정보 처리방침 변경</h2>
                            </div>
                            <div className="pl-11">
                                <p className="text-gray-700 leading-relaxed">
                                    이 개인정보 처리방침은 <strong className="text-gray-900">2025.03.01</strong>부터 적용됩니다.
                                </p>
                            </div>
                        </section>
                    </div>
                </div>

                {/* 하단 액션 */}
                <div className="mt-12 flex justify-end">
                    <div className="flex space-x-3">
                        <Link
                            href="/terms"
                            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                            이용약관 보기
                        </Link>
                        <Link
                            href="/contact"
                            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                        >
                            문의하기
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
