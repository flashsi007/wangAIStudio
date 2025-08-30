
"use client"
import '@ant-design/v5-patch-for-react-19';
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check, Zap, BookOpen, Crown, Star, Trophy, PenTool, Sparkles, Users, Target } from 'lucide-react';
import { message } from 'antd';
import { publicConfig } from '@/app/config'
import { Icon } from '@/components/Icon'
import styles from '@/styles/pricingPage.module.scss'

export default function PricingPage() {
    const pricingPlans = [
        {
            id: 'starter',
            name: '入门版',
            description: '适合初次体验AI写作的用户',
            price: 9.90,
            wordCount: '10万字',
            charCount: 100000,
            icon: 'PenTool',
        },
        {
            id: 'advanced',
            name: '进阶版',
            description: '适合有一定写作需求的用户',
            price: 55.00,
            wordCount: '50万字',
            charCount: 500000,
            icon: 'BookOpen',
        },
        {
            id: 'professional',
            name: '专业版',
            description: '适合专业作家和重度用户',
            price: 99.00,
            wordCount: '100万字',
            charCount: 1000000,
            icon: 'Crown',
        },
        {
            id: 'flagship',
            name: '旗舰版',
            description: '超值优惠，适合长期创作用户',
            price: 159.00,
            originalPrice: 399.00,
            savings: 240,
            wordCount: '200万字',
            charCount: 2000000,
            icon: 'Star',
            badge: '限时优惠',
        },
        {
            id: 'supreme',
            name: '至尊版',
            description: '终极优惠，创作无忧',
            price: 188.00,
            originalPrice: 599.00,
            savings: 411,
            wordCount: '300万字',
            charCount: 3000000,
            icon: 'Trophy',
            badge: '最超值',
        }
    ];


    const tabs = [
        'AI流式对话创作',
        '思维导图大纲管理',
        '智能章节编辑器',
        '角色关系管理',
        '多AI模型切换',
        '优先客服支持'
    ]

    const features = [
        { icon: <Zap className="w-5 h-5" />, text: "AI流式写作助手，告别卡文困扰" },
        { icon: <Target className="w-5 h-5" />, text: "思维导图大纲，结构化创作" },
        { icon: <Sparkles className="w-5 h-5" />, text: "智能续写生成，10倍提升效率" },
        { icon: <Users className="w-5 h-5" />, text: "角色关系管理，人物立体丰满" }
    ];



    const isLogin = () => {
        const userStore = window.localStorage.getItem('user-storage');
        if (!userStore) return false;
        const storage = JSON.parse(userStore);
        return storage.state?.userInfo?.token ? true : false;
    }

    const handlePricing = () => {
        let res = isLogin();
        if (!res) return window.location.href = '/login';

        message.warning('暂未开放购买，敬请期待！');


    }

    return (
        <div className={styles.page}>
            <ScrollArea className={styles.scrollArea}>
                <div className={styles.container}>
                    {/* Header Section */}
                    <div className={styles.headerSection}>
                        <div className={styles.badge}>
                            <Sparkles className={styles.badgeIcon} />
                            <span className={styles.badgeText}>
                                网文大神助手 - AI写作工具
                            </span>
                        </div>
                        <h1 className={styles.mainTitle}>
                            选择适合你的创作套餐
                        </h1>
                        <p className={styles.subtitle}>
                            <span className={styles.subtitleText}>
                                告别创作瓶颈，摆脱灵感枯竭！专业AI写作助手助力网文作者高效创作
                            </span>
                        </p>

                        {/* Features Highlight */}
                        <div className={styles.featuresGrid}>
                            {features.map((feature, index) => (
                                <div key={index} className={styles.featureItem}>
                                    <div className={styles.featureIcon}>{feature.icon}</div>
                                    <span className={styles.featureText}>{feature.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pricing Cards */}
                    <div className={styles.pricingGrid}>
                        {pricingPlans.map((plan, index) => {
                            const isPopular = plan.badge === '限时优惠' || plan.badge === '最超值';
                            const isSupreme = plan.id === 'supreme';

                            return (
                                <Card
                                    key={plan.id}
                                    className={`${styles.pricingCard} ${
                                        isPopular ? styles.pricingCardPopular : ''
                                    } ${isSupreme ? styles.pricingCardSupreme : ''}`
                                    }>
                                    {plan.badge && (
                                        <Badge
                                            className={`${styles.cardBadge} ${
                                                isSupreme ? styles.cardBadgeSupreme : styles.cardBadgeDefault
                                            }`}
                                        >
                                            {plan.badge}
                                        </Badge>
                                    )}

                                    <CardHeader className={styles.cardHeader}>
                                        <div className={`${styles.cardIcon} ${
                                            isPopular ? styles.cardIconPopular : styles.cardIconDefault
                                        }`}>
                                            <Icon className={styles.cardIconInner} name={plan.icon} />
                                        </div>
                                        <CardTitle className={styles.cardTitle}>
                                            <span className={styles.cardTitleText}>
                                                {plan.name}
                                            </span>
                                        </CardTitle>
                                        <CardDescription className={styles.cardDescription}>
                                            <span className={styles.cardDescriptionText}>
                                                {plan.description}
                                            </span>
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent className={styles.cardContent}>
                                        <div className={styles.priceSection}>
                                            {plan.originalPrice && (
                                                <div className={styles.originalPrice}>
                                                    <span className={styles.originalPriceText}>¥{plan.originalPrice}</span>
                                                    <Badge variant="destructive" className={styles.savingsBadge}>
                                                        省¥{plan.savings}
                                                    </Badge>
                                                </div>
                                            )}
                                            <div className={styles.currentPrice}>
                                                <span className={styles.currentPriceText}>
                                                    ¥{plan.price}
                                                </span>
                                            </div>
                                            <div className={styles.wordCount}>
                                                <span className={styles.wordCountText}>
                                                    {plan.wordCount}
                                                </span>
                                            </div>
                                            <div className={styles.wordCountLabel}>
                                                AI生成字数额度
                                            </div>
                                        </div>

                                        <Separator className={styles.separator} />

                                        <div className={styles.featuresList}>
                                            {
                                                tabs.map((tab) => (
                                                    <div key={tab} className={styles.featureItem}>
                                                        <Check className={styles.featureCheck} />
                                                        <span className={styles.featureItemText}>{tab}</span>
                                                    </div>
                                                ))
                                            }
                                            {/* {(plan.charCount >= 500000) && (
                                                <div className="flex items-center gap-3">
                                                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                                                    <span className="text-sm">多AI模型切换</span>
                                                </div>
                                            )}
                                            {(plan.charCount >= 1000000) && (
                                                <div className="flex items-center gap-3">
                                                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                                                    <span className="text-sm">优先客服支持</span>
                                                </div>
                                            )}
                                            {isSupreme && (
                                                <div className="flex items-center gap-3">
                                                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                                                    <span className="text-sm font-semibold text-primary">专属创作顾问</span>
                                                </div>
                                            )} */}

                                        </div>
                                    </CardContent>

                                    <CardFooter className={styles.cardFooter}>
                                        <Button
                                            onClick={() => handlePricing()}
                                            className={`${styles.cardButton} ${
                                                isPopular ? styles.cardButtonPopular : ''
                                            } ${isSupreme ? styles.cardButtonSupreme : ''}`}
                                            size="lg"
                                        >
                                            {isSupreme ? '立即抢购' : '选择套餐'}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Bottom CTA Section */}
                    <div className={styles.ctaSection}>
                        <h3 className={styles.ctaTitle}>
                            <span className={styles.ctaTitleText}>
                                还在为创作瓶颈而烦恼？
                            </span>
                        </h3>
                        <p className={styles.ctaDescription}>
                            <span className={styles.ctaDescriptionText}>
                                网文大神助手专为解决网文作者核心痛点而生：告别灵感枯竭、摆脱构思耗时、避免情节混乱。
                                让AI成为你的创作伙伴，从大纲到成文，全程智能辅助！
                            </span>
                        </p>
                        <div className={styles.ctaButtons}>
                            <Button size="lg" className={styles.ctaButton} onClick={() => window.location.href = '/dashboard'}>
                                <Sparkles className={styles.ctaButtonIcon} />
                                免费试用
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                className={styles.ctaButton}
                                onClick={() => window.location.href = publicConfig.blibliUrl}>
                                查看功能演示
                            </Button>
                        </div>
                    </div>
                </div>
            </ScrollArea>
        </div>
    );


    
}