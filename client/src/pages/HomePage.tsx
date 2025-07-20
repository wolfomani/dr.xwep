import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Bot, 
  Code2, 
  Smartphone, 
  BarChart3, 
  Users, 
  Headphones,
  ArrowRight,
  Sparkles,
  Zap,
  Target,
  Globe,
  Shield,
  TrendingUp,
  MessageSquare,
  Play,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'wouter';
import logoUrl from '@assets/drx-logo_1752989300116.png';

const features = [
  {
    icon: MessageSquare,
    title: 'دردشة ذكية',
    description: 'محادثات متقدمة مع نماذج AI متعددة',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
  },
  {
    icon: Code2,
    title: 'تطوير الويب',
    description: 'حلول ويب متطورة ومتجاوبة',
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
  },
  {
    icon: Smartphone,
    title: 'تطبيقات الجوال',
    description: 'تطبيقات iOS وAndroid نative',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
  },
  {
    icon: BarChart3,
    title: 'تحليلات ذكية',
    description: 'رؤى عميقة من البيانات',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
  },
  {
    icon: Users,
    title: 'استشارات تقنية',
    description: 'خبرة متخصصة في التكنولوجيا',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
  },
  {
    icon: Headphones,
    title: 'دعم 24/7',
    description: 'فريق دعم متاح على مدار الساعة',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
  },
];

const statistics = [
  { number: '10,000+', label: 'مستخدم نشط', icon: Users },
  { number: '50,000+', label: 'مشروع مكتمل', icon: Target },
  { number: '99.9%', label: 'وقت التشغيل', icon: Shield },
  { number: '24/7', label: 'دعم فني', icon: Headphones },
];

export function HomePage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header Navigation */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img src={logoUrl} alt="DRX Logo" className="w-8 h-8" />
              <span className="text-xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                DRX AI Hub
              </span>
            </div>

            <nav className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-gray-300 hover:text-white transition-colors">الرئيسية</Link>
              <Link href="/services" className="text-gray-300 hover:text-white transition-colors">الخدمات</Link>
              <Link href="/portfolio" className="text-gray-300 hover:text-white transition-colors">المعرض</Link>
              <Link href="/analytics" className="text-gray-300 hover:text-white transition-colors">التحليلات</Link>
              <Link href="/about" className="text-gray-300 hover:text-white transition-colors">من نحن</Link>
              <Link href="/contact" className="text-gray-300 hover:text-white transition-colors">تواصل معنا</Link>
            </nav>

            <div className="flex items-center gap-3">
              <Link href="/chat">
                <Button variant="ghost" className="text-gray-300 hover:text-white">
                  تسجيل الدخول
                </Button>
              </Link>
              <Link href="/chat">
                <Button className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600">
                  ابدأ الآن
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-950 to-black"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.1),transparent_70%)]"></div>
        
        <div className="container mx-auto text-center relative z-10">
          <Badge className="mb-6 bg-red-500/20 text-red-300 border-red-500/30">
            <Sparkles className="w-3 h-3 mr-1" />
            منصة الذكاء الاصطناعي الشاملة
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            مستقبل التطوير
            <br />
            <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              بالذكاء الاصطناعي
            </span>
          </h1>

          <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto">
            منصة متكاملة تجمع أحدث تقنيات الذكاء الاصطناعي لتطوير الويب والجوال والتحليلات 
            مع دعم نماذج DeepSeek وGroq وDeepSeek-V3
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/chat">
              <Button size="lg" className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-lg px-8">
                <Play className="w-5 h-5 mr-2" />
                ابدأ الآن مجاناً
              </Button>
            </Link>
            <Link href="/chat">
              <Button size="lg" variant="outline" className="border-gray-600 text-white hover:bg-gray-800 text-lg px-8">
                <MessageSquare className="w-5 h-5 mr-2" />
                تجربة الدردشة
              </Button>
            </Link>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
            {statistics.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-xl mb-3">
                  <stat.icon className="w-6 h-6 text-red-400" />
                </div>
                <div className="text-2xl font-bold text-white">{stat.number}</div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gray-900/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              ميزات <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">متطورة</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              نوفر مجموعة شاملة من الأدوات والخدمات المدعومة بالذكاء الاصطناعي
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-gray-900/50 border-gray-800 hover:border-gray-700 transition-all duration-300 group">
                <CardHeader>
                  <div className={cn("inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4", feature.bgColor)}>
                    <feature.icon className={cn("w-6 h-6", feature.color)} />
                  </div>
                  <CardTitle className="text-white group-hover:text-gray-100 transition-colors">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/services">
                    <Button variant="ghost" className="w-full justify-between text-gray-400 hover:text-white">
                      اعرف المزيد
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              خدماتنا <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">المتميزة</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              حلول متكاملة لجميع احتياجاتك التقنية
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 border-blue-800/50">
              <CardHeader>
                <Globe className="w-8 h-8 text-blue-400 mb-2" />
                <CardTitle className="text-white">تطوير الويب</CardTitle>
                <CardDescription className="text-blue-200">
                  مواقع وتطبيقات ويب متطورة ومتجاوبة
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-blue-100">
                  <li>• React & Next.js</li>
                  <li>• Node.js & Express</li>
                  <li>• تصميم متجاوب</li>
                  <li>• SEO محسن</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 border-purple-800/50">
              <CardHeader>
                <Smartphone className="w-8 h-8 text-purple-400 mb-2" />
                <CardTitle className="text-white">تطبيقات الجوال</CardTitle>
                <CardDescription className="text-purple-200">
                  تطبيقات iOS وAndroid عالية الأداء
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-purple-100">
                  <li>• React Native</li>
                  <li>• Flutter</li>
                  <li>• Native iOS/Android</li>
                  <li>• تطبيقات هجينة</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-900/30 to-green-800/30 border-green-800/50">
              <CardHeader>
                <BarChart3 className="w-8 h-8 text-green-400 mb-2" />
                <CardTitle className="text-white">ذكاء اصطناعي</CardTitle>
                <CardDescription className="text-green-200">
                  حلول AI متقدمة وتحليلات ذكية
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-green-100">
                  <li>• نماذج DeepSeek</li>
                  <li>• Groq Integration</li>
                  <li>• تحليل البيانات</li>
                  <li>• أتمتة العمليات</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Link href="/services">
              <Button size="lg" variant="outline" className="border-gray-600 text-white hover:bg-gray-800">
                عرض جميع الخدمات
                <ArrowRight className="w-5 h-5 mr-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-red-900/20 to-orange-900/20">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            هل أنت مستعد لبناء <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">المستقبل</span>؟
          </h2>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            انضم إلى آلاف المطورين والشركات التي تستخدم DRX AI Hub لتطوير مشاريعها
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/chat">
              <Button size="lg" className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-lg px-8">
                <Zap className="w-5 h-5 mr-2" />
                ابدأ مشروعك الآن
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-gray-600 text-white hover:bg-gray-800 text-lg px-8">
                تحدث مع خبير
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src={logoUrl} alt="DRX Logo" className="w-8 h-8" />
                <span className="text-xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                  DRX AI Hub
                </span>
              </div>
              <p className="text-gray-400 mb-4">
                منصة الذكاء الاصطناعي الشاملة لتطوير المستقبل
              </p>
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 cursor-pointer">
                  <Star className="w-4 h-4 text-gray-400" />
                </div>
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 cursor-pointer">
                  <Globe className="w-4 h-4 text-gray-400" />
                </div>
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 cursor-pointer">
                  <MessageSquare className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">روابط سريعة</h3>
              <div className="space-y-2">
                <Link href="/services" className="block text-gray-400 hover:text-white transition-colors">الخدمات</Link>
                <Link href="/portfolio" className="block text-gray-400 hover:text-white transition-colors">المعرض</Link>
                <Link href="/about" className="block text-gray-400 hover:text-white transition-colors">من نحن</Link>
                <Link href="/contact" className="block text-gray-400 hover:text-white transition-colors">تواصل معنا</Link>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">الخدمات</h3>
              <div className="space-y-2">
                <div className="text-gray-400">تطوير الويب</div>
                <div className="text-gray-400">تطبيقات الجوال</div>
                <div className="text-gray-400">ذكاء اصطناعي</div>
                <div className="text-gray-400">استشارات تقنية</div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">معلومات الاتصال</h3>
              <div className="space-y-2 text-gray-400">
                <div>info@drx-ai-hub.com</div>
                <div>+966 123 456 789</div>
                <div>الرياض، المملكة العربية السعودية</div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2024 DRX AI Hub. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}