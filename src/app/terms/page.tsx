'use client';

import { ArrowLeft, FileText, Calendar, Shield, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function TermsPage() {
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
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                            <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">아치셈틀 이용약관</h1>
                            <p className="text-gray-600 mt-1">서비스 이용조건과 운영에 관한 사항</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4" />
                            <span>시행일: 2025년 03월 01일</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Shield className="w-4 h-4" />
                            <span>최종 수정: 2025년 01월 03일</span>
                        </div>
                    </div>
                </div>

                {/* 약관 내용 */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="p-8 space-y-8">

                        {/* 제1조 */}
                        <section className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <span className="text-blue-600 font-bold text-sm">1</span>
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">목적</h2>
                            </div>
                            <div className="pl-11">
                                <p className="text-gray-700 leading-relaxed">
                                    본 이용약관은 <strong className="text-gray-900">아치셈틀(이하 &quot;학회&quot;)</strong>이 제공하는 서비스의 이용조건과 운영에 관한 사항을 규정하는 것을 목적으로 합니다.
                                </p>
                            </div>
                        </section>

                        {/* 제2조 */}
                        <section className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <span className="text-purple-600 font-bold text-sm">2</span>
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">용어의 정의</h2>
                            </div>
                            <div className="pl-11">
                                <p className="text-gray-700 leading-relaxed mb-4">
                                    본 약관에서 사용하는 주요 용어의 정의는 다음과 같습니다.
                                </p>
                                <div className="space-y-3">
                                    <div className="flex items-start space-x-3">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                        <div>
                                            <strong className="text-gray-900">회원:</strong>
                                            <span className="text-gray-700"> 학회의 약관에 동의하고 개인정보를 제공하여 회원 등록을 완료한 자로, 학회 서비스 이용계약을 체결하고 학회를 이용하는 자를 의미합니다.</span>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                                        <div>
                                            <strong className="text-gray-900">이용계약:</strong>
                                            <span className="text-gray-700"> 학회의 서비스 이용과 관련하여 학회와 회원 간에 체결하는 계약을 의미합니다.</span>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                                        <div>
                                            <strong className="text-gray-900">회원 아이디(ID):</strong>
                                            <span className="text-gray-700"> 회원의 식별과 서비스 이용을 위해 회원별로 부여하는 고유한 문자와 숫자의 조합을 의미합니다.</span>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                                        <div>
                                            <strong className="text-gray-900">비밀번호:</strong>
                                            <span className="text-gray-700"> 회원의 개인정보 보호를 위해 회원이 설정한 문자 및 숫자의 조합을 의미합니다.</span>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                                        <div>
                                            <strong className="text-gray-900">운영진:</strong>
                                            <span className="text-gray-700"> 학회의 서비스 운영 및 관리를 담당하는 자를 의미합니다.</span>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                                        <div>
                                            <strong className="text-gray-900">해지:</strong>
                                            <span className="text-gray-700"> 회원이 이용계약을 해약하는 것을 의미합니다.</span>
                                        </div>
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
                                <h2 className="text-xl font-bold text-gray-900">약관 외 준칙</h2>
                            </div>
                            <div className="pl-11">
                                <p className="text-gray-700 leading-relaxed">
                                    운영진은 필요할 경우 별도의 운영정책을 공지할 수 있으며, 본 약관과 운영정책이 충돌하는 경우 운영정책이 우선 적용됩니다.
                                </p>
                            </div>
                        </section>

                        {/* 제4조 */}
                        <section className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                    <span className="text-orange-600 font-bold text-sm">4</span>
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">이용계약 체결</h2>
                            </div>
                            <div className="pl-11">
                                <div className="space-y-3">
                                    <p className="text-gray-700 leading-relaxed">
                                        <span className="font-semibold text-gray-900">1.</span> 이용계약은 학회의 회원으로 가입하고자 하는 자가 본 약관 내용에 동의하고 가입 신청을 완료한 후, 학회의 승인을 받아 성립됩니다.
                                    </p>
                                    <p className="text-gray-700 leading-relaxed">
                                        <span className="font-semibold text-gray-900">2.</span> 회원은 가입 신청 시 본 약관을 읽고 &quot;동의합니다&quot; 버튼을 선택함으로써 본 약관에 동의한 것으로 간주됩니다.
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
                                <h2 className="text-xl font-bold text-gray-900">서비스 이용 신청</h2>
                            </div>
                            <div className="pl-11">
                                <div className="space-y-3">
                                    <p className="text-gray-700 leading-relaxed">
                                        <span className="font-semibold text-gray-900">1.</span> 회원으로 가입하여 학회의 서비스를 이용하고자 하는 자는 학회가 요청하는 정보를 제공해야 합니다.
                                    </p>
                                    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                                        <div className="flex items-start space-x-2">
                                            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                                            <p className="text-red-800 text-sm">
                                                <span className="font-semibold text-gray-900">2.</span> 타인의 정보를 도용하거나 허위 정보를 입력한 회원은 학회 이용과 관련된 어떠한 권리도 주장할 수 없으며, 법적 책임을 질 수 있습니다.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 제6조 */}
                        <section className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                                    <span className="text-indigo-600 font-bold text-sm">6</span>
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">개인정보 보호</h2>
                            </div>
                            <div className="pl-11">
                                <div className="space-y-3">
                                    <p className="text-gray-700 leading-relaxed">
                                        <span className="font-semibold text-gray-900">1.</span> 학회는 회원 가입 시 제공한 개인정보를 보호하며, <strong className="text-gray-900">비밀번호를 직접 저장하지 않습니다</strong>.
                                    </p>
                                    <p className="text-gray-700 leading-relaxed">
                                        <span className="font-semibold text-gray-900">2.</span> 학회는 관계법령에 따라 회원의 개인정보를 보호하기 위해 노력하며, 자세한 사항은 <strong className="text-gray-900">개인정보 처리방침</strong>을 따릅니다.
                                    </p>
                                    <p className="text-gray-700 leading-relaxed">
                                        <span className="font-semibold text-gray-900">3.</span> 회원의 귀책 사유로 인해 발생한 개인정보 유출에 대해 학회는 책임을 지지 않습니다.
                                    </p>
                                    <p className="text-gray-700 leading-relaxed">
                                        <span className="font-semibold text-gray-900">4.</span> 회원이 법령 또는 학회 운영 정책을 위반하는 경우, 학회는 관련 기관의 요청에 따라 회원 정보를 열람하거나 제공할 수 있습니다.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* 제7조 */}
                        <section className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                                    <span className="text-teal-600 font-bold text-sm">7</span>
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">운영진의 의무</h2>
                            </div>
                            <div className="pl-11">
                                <div className="space-y-3">
                                    <p className="text-gray-700 leading-relaxed">
                                        <span className="font-semibold text-gray-900">1.</span> 학회 운영진은 회원의 의견이나 불만이 정당하다고 판단될 경우 신속하게 해결하기 위해 노력합니다.
                                    </p>
                                    <p className="text-gray-700 leading-relaxed">
                                        <span className="font-semibold text-gray-900">2.</span> 운영진은 지속적이고 안정적인 서비스 제공을 위해 최선을 다하며, 시스템 장애 발생 시 신속히 복구할 수 있도록 조치합니다.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* 제8조 */}
                        <section className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                                    <span className="text-pink-600 font-bold text-sm">8</span>
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">회원의 의무</h2>
                            </div>
                            <div className="pl-11">
                                <div className="space-y-3">
                                    <p className="text-gray-700 leading-relaxed">
                                        <span className="font-semibold text-gray-900">1.</span> 회원은 본 약관, 학회의 공지사항, 관계법령을 준수해야 합니다.
                                    </p>
                                    <p className="text-gray-700 leading-relaxed">
                                        <span className="font-semibold text-gray-900">2.</span> 회원은 학회의 운영을 방해하거나 학회의 명예를 손상하는 행위를 해서는 안 됩니다.
                                    </p>
                                    <p className="text-gray-700 leading-relaxed">
                                        <span className="font-semibold text-gray-900">3.</span> 회원은 자신의 계정을 타인에게 양도하거나 공유할 수 없습니다.
                                    </p>
                                    <p className="text-gray-700 leading-relaxed">
                                        <span className="font-semibold text-gray-900">4.</span> 회원은 학회의 저작권 및 기타 지식재산권을 침해해서는 안 됩니다.
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
                                <h2 className="text-xl font-bold text-gray-900">서비스 이용 시간 및 제한</h2>
                            </div>
                            <div className="pl-11">
                                <div className="space-y-3">
                                    <p className="text-gray-700 leading-relaxed">
                                        <span className="font-semibold text-gray-900">1.</span> 학회 서비스는 연중무휴 24시간 제공을 원칙으로 합니다.
                                    </p>
                                    <p className="text-gray-700 leading-relaxed">
                                        <span className="font-semibold text-gray-900">2.</span> 학회는 다음과 같은 사유로 사전 공지 없이 서비스를 일시적 또는 영구적으로 중단할 수 있습니다.
                                    </p>
                                    <div className="ml-4 space-y-2">
                                        <div className="flex items-start space-x-2">
                                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                                            <span className="text-gray-600 text-sm">긴급한 시스템 점검, 증설, 교체, 오류 발생 시</span>
                                        </div>
                                        <div className="flex items-start space-x-2">
                                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                                            <span className="text-gray-600 text-sm">국가 비상사태, 정전, 천재지변 등의 불가항력적 사유가 있는 경우</span>
                                        </div>
                                        <div className="flex items-start space-x-2">
                                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                                            <span className="text-gray-600 text-sm">전기통신사업법 등 관계법령에 따른 통신서비스 중지 시</span>
                                        </div>
                                        <div className="flex items-start space-x-2">
                                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                                            <span className="text-gray-600 text-sm">서비스 이용량 폭주로 인해 정상적인 서비스 제공이 어려운 경우</span>
                                        </div>
                                    </div>
                                    <p className="text-gray-700 leading-relaxed">
                                        <span className="font-semibold text-gray-900">3.</span> 위 사유에 따른 서비스 중단 시, 학회는 사전 또는 사후 공지를 통해 회원에게 안내합니다.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* 제10조 */}
                        <section className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-lime-100 rounded-lg flex items-center justify-center">
                                    <span className="text-lime-600 font-bold text-sm">10</span>
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">서비스 이용 해지 및 제한</h2>
                            </div>
                            <div className="pl-11">
                                <div className="space-y-3">
                                    <p className="text-gray-700 leading-relaxed">
                                        <span className="font-semibold text-gray-900">1.</span> 회원이 서비스 이용을 해지하고자 할 경우, 온라인을 통해 해지 신청을 해야 합니다.
                                    </p>
                                    <p className="text-gray-700 leading-relaxed">
                                        <span className="font-semibold text-gray-900">2.</span> 회원이 아래의 행위를 할 경우 학회는 회원의 서비스 이용을 제한할 수 있습니다.
                                    </p>
                                    <div className="ml-4 space-y-2">
                                        <div className="flex items-start space-x-2">
                                            <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                                            <span className="text-gray-600 text-sm">가입 신청 시 허위 정보를 등록하는 경우</span>
                                        </div>
                                        <div className="flex items-start space-x-2">
                                            <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                                            <span className="text-gray-600 text-sm">타인의 계정을 도용하거나 무단으로 사용하는 경우</span>
                                        </div>
                                        <div className="flex items-start space-x-2">
                                            <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                                            <span className="text-gray-600 text-sm">학회의 명예를 훼손하는 행위를 하는 경우</span>
                                        </div>
                                        <div className="flex items-start space-x-2">
                                            <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                                            <span className="text-gray-600 text-sm">학회 운영을 고의로 방해하는 경우</span>
                                        </div>
                                        <div className="flex items-start space-x-2">
                                            <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                                            <span className="text-gray-600 text-sm">범죄 행위에 직간접적으로 연관된 경우</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 제11조 */}
                        <section className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                                    <span className="text-amber-600 font-bold text-sm">11</span>
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">게시물 관리 및 운영</h2>
                            </div>
                            <div className="pl-11">
                                <div className="space-y-3">
                                    <p className="text-gray-700 leading-relaxed">
                                        <span className="font-semibold text-gray-900">1.</span> 게시물과 자료의 관리 책임은 학회 운영진에게 있으며, 불건전한 게시물을 발견할 경우 삭제할 수 있습니다.
                                    </p>
                                    <p className="text-gray-700 leading-relaxed">
                                        <span className="font-semibold text-gray-900">2.</span> 회원이 올린 게시물의 저작권은 회원에게 있으나, 학회는 비영리적인 목적에 한해 게시물을 활용할 수 있습니다.
                                    </p>
                                    <p className="text-gray-700 leading-relaxed">
                                        <span className="font-semibold text-gray-900">3.</span> 다음과 같은 경우 운영진은 게시물을 사전 통지 없이 삭제할 수 있습니다.
                                    </p>
                                    <div className="ml-4 space-y-2">
                                        <div className="flex items-start space-x-2">
                                            <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                                            <span className="text-gray-600 text-sm">타인의 명예를 훼손하거나 모욕적인 내용을 포함하는 경우</span>
                                        </div>
                                        <div className="flex items-start space-x-2">
                                            <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                                            <span className="text-gray-600 text-sm">불법적인 정보, 저작권 침해 자료를 포함하는 경우</span>
                                        </div>
                                        <div className="flex items-start space-x-2">
                                            <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                                            <span className="text-gray-600 text-sm">특정 단체, 정치적·사회적 이슈를 선동하는 내용이 포함된 경우</span>
                                        </div>
                                        <div className="flex items-start space-x-2">
                                            <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                                            <span className="text-gray-600 text-sm">기타 공공질서 및 미풍양속을 해치는 내용이 포함된 경우</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 제12조 */}
                        <section className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                                    <span className="text-slate-600 font-bold text-sm">12</span>
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">책임 및 면책사항</h2>
                            </div>
                            <div className="pl-11">
                                <div className="space-y-3">
                                    <p className="text-gray-700 leading-relaxed">
                                        <span className="font-semibold text-gray-900">1.</span> 학회는 회원이 서비스를 통해 기대하는 특정 목적을 달성하지 못하였거나, 회원의 귀책 사유로 인해 발생한 손해에 대해 책임을 지지 않습니다.
                                    </p>
                                    <p className="text-gray-700 leading-relaxed">
                                        <span className="font-semibold text-gray-900">2.</span> 학회는 불가항력적인 사유(천재지변, 전쟁, 국가비상사태 등)로 인한 서비스 중단에 대한 책임을 지지 않습니다.
                                    </p>
                                    <p className="text-gray-700 leading-relaxed">
                                        <span className="font-semibold text-gray-900">3.</span> 학회는 회원 간 또는 회원과 제3자 간의 분쟁에 개입하지 않으며, 발생한 분쟁에 대한 책임을 지지 않습니다.
                                    </p>
                                    <p className="text-gray-700 leading-relaxed">
                                        <span className="font-semibold text-gray-900">4.</span> 학회는 회원이 게시한 자료의 신뢰성, 정확성에 대한 책임을 지지 않으며, 해당 정보로 인한 피해에 대해서도 책임을 지지 않습니다.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* 제13조 */}
                        <section className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <span className="text-gray-600 font-bold text-sm">13</span>
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">손해배상</h2>
                            </div>
                            <div className="pl-11">
                                <div className="space-y-3">
                                    <p className="text-gray-700 leading-relaxed">
                                        <span className="font-semibold text-gray-900">1.</span> 회원의 고의 또는 과실로 인해 학회에 손해가 발생한 경우, 회원은 그 손해를 배상할 책임이 있습니다.
                                    </p>
                                    <p className="text-gray-700 leading-relaxed">
                                        <span className="font-semibold text-gray-900">2.</span> 학회는 무료로 제공되는 서비스와 관련하여 학회의 귀책 사유가 없는 한 회원에게 발생한 손해에 대해 책임을 지지 않습니다.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* 제14조 */}
                        <section className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
                                    <span className="text-violet-600 font-bold text-sm">14</span>
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">약관의 변경 및 공지</h2>
                            </div>
                            <div className="pl-11">
                                <div className="space-y-3">
                                    <p className="text-gray-700 leading-relaxed">
                                        <span className="font-semibold text-gray-900">1.</span> 학회는 필요하다고 판단될 경우 본 약관을 변경할 수 있으며, 변경된 약관은 학회 웹사이트 또는 공지를 통해 사전 고지됩니다.
                                    </p>
                                    <p className="text-gray-700 leading-relaxed">
                                        <span className="font-semibold text-gray-900">2.</span> 변경된 약관 시행 이후에도 서비스를 계속 이용하는 경우 변경된 약관에 동의한 것으로 간주됩니다.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* 부칙 */}
                        <section className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">부</span>
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">부칙</h2>
                            </div>
                            <p className="text-gray-700 leading-relaxed">
                                본 약관은 <strong className="text-gray-900">2025년 03월 01일</strong>부터 시행됩니다.
                            </p>
                        </section>
                    </div>
                </div>

                {/* 하단 액션 */}
                <div className="mt-12 flex justify-end">
                    <div className="flex space-x-3">
                        <Link
                            href="/privacy"
                            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                            개인정보처리방침 보기
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
