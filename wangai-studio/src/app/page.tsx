"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";
import { publicConfig } from "@/app/config";
import FloatingContact from "@/components/FloatingContact";
import landingPage from '@/styles/landingPage.module.scss'
import { Sparkles, Network, Type, } from 'lucide-react';

export default function LandingPage() {

  return (
    <div className={`${landingPage.page}`} >

      <header className={`${landingPage.header}`}>
        <div className={`${landingPage.container}`}>
          <nav className={`${landingPage.nav}`}>
            <div className={`${landingPage['logo-section']}`}>
              <h1 className={`${landingPage.title}`}>
                <span className={`${landingPage['gradient-text']}`}>
                  网文大神助手
                </span>
              </h1>
            </div>
            <div className={`${landingPage['menu-section']}`}>

              <Link href="https://github.com/flashsi007/wangAIStudio">
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-github-icon lucide-github"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" /></svg>
                </div>
              </Link>

              <Link href="/article">

                <Button variant="ghost">部署文档</Button>
              </Link>

              <Link href="/login">
                <Button variant="ghost">登录</Button>
              </Link>
              <Link href="/dashboard">
                <Button className={landingPage['btn-lg']} style={{
                  borderRadius: '0.8rem',
                }} >开始创作</Button>
              </Link>
            </div>
          </nav>
        </div>
      </header>
      <ScrollArea className="h-[90vh] w-full"  >

        {/* Hero Section */}
        <section className={landingPage['hero-section']}>
          <div className={landingPage.container}>
            <h1 className={landingPage['main-title']}>
              网文大神助手 - AI写小说工具
            </h1>
            <p className={landingPage.description}>
              <span className={landingPage['gradient-text-alt']}>
                告别创作瓶颈，摆脱灵感枯竭！专业AI写作助手帮你快速构建小说大纲、
                丰富角色设定、生成精彩情节，让每一位网文作者都能高效创作出优质作品
              </span>
            </p>
            <div className={`${landingPage['button-group']} `}>
              <Link href="/dashboard">
                <Button size="lg"

                  style={{
                    borderRadius: '0.8rem',
                  }}
                  className={landingPage['btn-lg']}>
                  立即开始创作
                </Button>
              </Link>


              <Link href={publicConfig.blibliUrl}>
                <Button
                  style={{
                    borderRadius: '0.8rem',
                  }}
                  variant="outline" size="lg" className={landingPage['btn-lg']}>
                  查看功能演示
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className={landingPage.FeaturesSection}>
          <div className={landingPage.container}>
            <div className={landingPage['section-header']}>
              <h2
                style={{
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'linear-gradient(to right, #171717,#3a3a3a, rgba(#494848, 0.6))',
                }}
              >
                <span>
                  专为网文作者打造的AI创作工具链
                </span>
              </h2>
              <p>
                <span>
                  从构思到成文，全流程AI辅助，解决创作过程中的每一个痛点
                </span>
              </p>
            </div>

            <div className={landingPage['features-grid']}>
              <Card className={landingPage['feature-card']}>
                <CardHeader>
                  <div className={landingPage['icon-container']}>
                    <Sparkles style={{ width: '1.8rem', height: '1.8rem', }} />
                  </div>
                  <CardTitle>
                    <span>
                      AI流式写作助手
                    </span>
                  </CardTitle>
                  <CardDescription>
                    <span>
                      实时对话式AI创作，支持多模型切换，提供专业的网文写作指导和内容生成
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul>
                    <li>• 流式AI对话创作</li>
                    <li>• 多AI模型支持</li>
                    <li>• 上下文智能记忆</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className={landingPage['feature-card']}>
                <CardHeader>
                  <div className={landingPage['icon-container']}>
                    <Network style={{ width: '1.8rem', height: '1.8rem', }} />
                  </div>
                  <CardTitle>
                    <span>
                      思维导图式大纲
                    </span>
                  </CardTitle>
                  <CardDescription>
                    <span>
                      可视化大纲构建，支持世界观设定、角色关系、情节脉络的结构化管理
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul>
                    <li>• 可视化大纲编辑</li>
                    <li>• 角色关系图谱</li>
                    <li>• 情节结构管理</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className={landingPage['feature-card']}>
                <CardHeader>
                  <div className={landingPage['icon-container']}>
                    <Type style={{ width: '1.8rem', height: '1.8rem' }} />
                  </div>
                  <CardTitle>
                    <span>
                      智能编辑器
                    </span>
                  </CardTitle>
                  <CardDescription>
                    <span>
                      集成AI功能的富文本编辑器，支持章节管理、内容生成、智能续写
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul>
                    <li>
                      <span>
                        • AI内容生成
                      </span>
                    </li>
                    <li>
                      <span>
                        • 智能章节管理
                      </span>
                    </li>
                    <li>
                      <span>
                        • 一键导出功能
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>


        {/* Why Choose Us Section */}
        <section className={landingPage.ChooseUsSection}>
          <div className={landingPage.container}>
            <div className={landingPage['section-header']}>
              <h2>
                <span>
                  为什么选择网文大神助手？
                </span>
              </h2>
              <p style={{
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'linear-gradient(to right, #171717,#3a3a3a, rgba(#494848, 0.6))',
              }}>
                <span>
                  专为网文作者设计的AI写小说平台
                </span>
              </p>
            </div>

            <div className={landingPage['grid-cols-4']}>
              <div className={landingPage['feature-item']}>
                <div className={`${landingPage['icon-container']} ${landingPage['bg-green-100']}`}>
                  <svg className={landingPage['text-green-600']} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3>
                  <span>
                    10倍创作效率
                  </span>
                </h3>
                <p
                  style={{
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'linear-gradient(to right, #171717,#3a3a3a, rgba(#494848, 0.6))',
                  }}
                >
                  <span>
                    AI辅助大纲构建、角色设定、情节生成，日更万字不再是梦想
                  </span>
                </p>
              </div>

              <div className={landingPage['feature-item']}>
                <div className={`${landingPage['icon-container']} ${landingPage['bg-blue-100']}`}>
                  <svg className={landingPage['text-blue-600']} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3>
                  <span>
                    结构化创作
                  </span>
                </h3>
                <p>
                  <span>
                    思维导图式管理，让复杂的世界观和人物关系一目了然
                  </span>
                </p>
              </div>

              <div className={landingPage['feature-item']}>
                <div className={`${landingPage['icon-container']} ${landingPage['bg-purple-100']}`}>
                  <svg className={landingPage['text-purple-600']} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3>
                  <span>
                    智能续写
                  </span>
                </h3>
                <p>
                  <span>
                    卡文不再可怕，AI助手随时提供创作灵感和续写建议
                  </span>
                </p>
              </div>

              <div className={landingPage['feature-item']}>
                <div className={`${landingPage['icon-container']} ${landingPage['bg-orange-100']}`}>
                  <svg className={landingPage['text-orange-600']} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <h3>
                  <span>
                    多模型支持
                  </span>
                </h3>
                <p>
                  <span>
                    支持多种AI模型，根据不同创作需求选择最适合的AI助手
                  </span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pain Points Section */}
        <section className={landingPage.PainPointsSection}>
          <div className={landingPage.container}>
            <div className={landingPage['section-header']}>
              <h2>
                <span className={landingPage['gradient-foreground']}>
                  解决创作者的
                </span>
                <span className={landingPage['gradient-primary']}>
                  核心痛点
                </span>
              </h2>
            </div>

            <div className={landingPage['grid-cols-3']}>
              <Card>
                <CardHeader className={landingPage['card-header']}>
                  <CardTitle className={landingPage['card-title']}>
                    <span className={landingPage['gradient-red']}>
                      💔 灵感枯竭，无从下笔
                    </span>
                  </CardTitle>
                  <CardDescription className={landingPage['card-description']}>
                    <span className={landingPage['gradient-muted-foreground']}>
                      ✅ AI流式对话激发创作灵感，思维导图帮你理清思路，再也不怕面对空白页面
                    </span>
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className={landingPage['card-header']}>
                  <CardTitle className={landingPage['card-title']}>
                    <span className={landingPage['gradient-orange']}>
                      ⏰ 构思耗时，进度缓慢
                    </span>
                  </CardTitle>
                  <CardDescription className={landingPage['card-description']}>
                    <span className={landingPage['gradient-muted-foreground']}>
                      ✅ AI快速生成大纲框架、角色设定，智能编辑器支持章节管理，大幅提升创作效率
                    </span>
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className={landingPage['card-header']}>
                  <CardTitle className={landingPage['card-title']}>
                    <span className={landingPage['gradient-blue']}>
                      📚 情节混乱，人物单薄
                    </span>
                  </CardTitle>
                  <CardDescription className={landingPage['card-description']}>
                    <span className={landingPage['gradient-muted-foreground']}>
                      ✅ 可视化大纲管理复杂情节线，角色关系图谱让人物立体丰满，作品结构更清晰
                    </span>
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className={landingPage.CTASection}>
          <div className={landingPage.container}>
            <h2>
              <span className={landingPage['gradient-foreground']}>
                告别卡文，拥抱高效创作
              </span>
            </h2>
            <p>
              <span className={landingPage['gradient-muted-foreground']}>
                立即体验AI辅助创作的魅力，从大纲构思到章节写作，让每一个创意都能完美呈现
              </span>
            </p>
            <div className={landingPage['button-group']}>
              <Link href="/dashboard">
                <Button
                  style={{
                    borderRadius: '0.8rem',
                  }}
                  size="lg" className={landingPage['btn-lg']}>
                  立即开始创作
                </Button>
              </Link>
              <Link href={publicConfig.blibliUrl}>
                <Button
                  style={{
                    borderRadius: '0.8rem',
                  }}
                  variant="outline" size="lg" className={landingPage['btn-lg']}>
                  查看功能演示
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className={landingPage.footer}>
          <div className={landingPage.container}>
            <div className={landingPage["grid-cols-4"]}>
              <div>
                <h3 className={landingPage["gradient-foreground"]}>
                  网文大神助手
                </h3>
                <p className={`${landingPage["gradient-muted-foreground"]}`}>
                  专业的AI写作工具平台，用科技赋能创作，让每一位网文作者都能高效产出优质作品。
                </p>
              </div>
              <div>
                <h4 className={landingPage["gradient-foreground"]}>
                  产品功能
                </h4>
                <ul>
                  <li>
                    <Link href="/dashboard">
                      <span className={landingPage["gradient-muted-foreground"]}>
                        AI写作助手
                      </span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/dashboard">
                      <span className={landingPage["gradient-muted-foreground"]}>
                        思维导图大纲
                      </span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/dashboard">
                      <span className={landingPage["gradient-muted-foreground"]}>
                        智能编辑器
                      </span>
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className={landingPage["gradient-foreground"]}>
                  社区
                </h4>
                <ul>
                  <li>
                    <Link href="/community">
                      <span className={landingPage["gradient-muted-foreground"]}>
                        创作者交流
                      </span>
                    </Link>
                  </li>
                  <li>
                    <Link href="#">
                      <span className={landingPage["gradient-muted-foreground"]}>
                        功能教程
                      </span>
                    </Link>
                  </li>
                  <li>
                    <Link href="#">
                      <span className={landingPage["gradient-muted-foreground"]}>
                        使用帮助
                      </span>
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className={landingPage["gradient-foreground"]}>
                  联系我们
                </h4>
                <ul>
                  <li>
                    <Link href="#">
                      <span className={landingPage["gradient-muted-foreground"]}>
                        客服支持
                      </span>
                    </Link>
                  </li>
                  <li>
                    <Link href="#">
                      <span className={landingPage["gradient-muted-foreground"]}>
                        意见反馈
                      </span>
                    </Link>
                  </li>
                  <li>
                    <Link href="#">
                      <span className={landingPage["gradient-muted-foreground"]}>
                        商务合作
                      </span>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className={landingPage["bottom-section"]}>
              <p>
                <span className={landingPage["gradient-muted-foreground"]}>
                  &copy; 2024 网文大神助手. 保留所有权利.
                </span>
              </p>
              <a
                href="https://beian.miit.gov.cn/">
                <span className={landingPage["gradient-muted-foreground"]}>
                  粤ICP备2025450107号
                </span>
              </a>
            </div>
          </div>
        </footer>
      </ScrollArea>

      {/* 悬浮联系框 */}
      <FloatingContact />
    </div>
  );
}