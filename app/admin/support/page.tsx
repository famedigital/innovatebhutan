"use client";

import { useState, useEffect } from "react";
import { 
  FileText, 
  HelpCircle, 
  BookOpen, 
  MessageSquare, 
  ChevronRight,
  ExternalLink,
  LifeBuoy,
  Phone,
  Mail,
  Send,
  X,
  MessageCircle,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

interface FAQ {
  question: string;
  answer: string;
  category: string;
}

const FAQS: FAQ[] = [
  { question: "How do I create a new client?", answer: "Go to Clients > Add Client and fill in the details.", category: "Clients" },
  { question: "How do I generate an invoice?", answer: "Go to Invoices > New Invoice, select client and add line items.", category: "Finance" },
  { question: "How do I renew an AMC contract?", answer: "Go to AMC Contracts, select the expiring contract and click Renew.", category: "AMC" },
  { question: "How do I reset my password?", answer: "Use the login page 'Forgot Password' option or contact admin.", category: "Account" },
  { question: "How does the WhatsApp bot work?", answer: "Clients can message the bot to get auto-replies, create tickets, or get info.", category: "WhatsApp" },
  { question: "How do I add a new employee?", answer: "Go to HR & Payroll > Add Employee and fill the onboarding form.", category: "HR" },
];

export default function SupportPage() {
  const [showContact, setShowContact] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [contactForm, setContactForm] = useState({ subject: "", message: "", priority: "medium" });
  const [feedbackForm, setFeedbackForm] = useState({ type: "suggestion", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [recentTickets, setRecentTickets] = useState<any[]>([]);
  
  const supabase = createClient();

  useEffect(() => {
    fetchRecentTickets();
  }, []);

  const fetchRecentTickets = async () => {
    try {
      const { data } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      setRecentTickets(data || []);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const submitContact = async () => {
    if (!contactForm.subject || !contactForm.message) {
      toast.error("Please fill in all fields");
      return;
    }
    
    setSubmitting(true);
    try {
      const { error } = await supabase.from('tickets').insert({
        subject: contactForm.subject,
        description: contactForm.message,
        priority: contactForm.priority,
        status: 'open',
        source: 'support_page'
      });

      if (!error) {
        toast.success("Support ticket created!");
        setShowContact(false);
        setContactForm({ subject: "", message: "", priority: "medium" });
        fetchRecentTickets();
      } else {
        toast.error("Failed to create ticket");
      }
    } catch (err) {
      toast.error("Error submitting request");
    } finally {
      setSubmitting(false);
    }
  };

  const submitFeedback = async () => {
    if (!feedbackForm.message) {
      toast.error("Please enter your feedback");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from('feedback').insert({
        type: feedbackForm.type,
        message: feedbackForm.message,
        status: 'new'
      });

      if (!error) {
        toast.success("Feedback submitted. Thank you!");
        setShowFeedback(false);
        setFeedbackForm({ type: "suggestion", message: "" });
      }
    } catch (err) {
      toast.error("Error submitting feedback");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Support Center</h1>
          <p className="text-sm text-[#717171]">Help, documentation, and support resources</p>
        </div>
        <Button onClick={() => setShowContact(true)} className="bg-[#3ECF8E] hover:bg-[#34b27b] text-white">
          <MessageCircle className="w-4 h-4 mr-2" />
          Contact Support
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-4">
          {/* Quick Links */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button onClick={() => window.location.href = '/admin/docs'} className="p-4 bg-white rounded-xl border border-[#E5E5E1] hover:border-[#3ECF8E] transition-colors text-center">
              <FileText className="w-6 h-6 mx-auto text-[#3ECF8E] mb-2" />
              <span className="text-xs font-medium">Documentation</span>
            </button>
            <button onClick={() => window.location.href = '/admin/tickets'} className="p-4 bg-white rounded-xl border border-[#E5E5E1] hover:border-[#3ECF8E] transition-colors text-center">
              <HelpCircle className="w-6 h-6 mx-auto text-[#3ECF8E] mb-2" />
              <span className="text-xs font-medium">My Tickets</span>
            </button>
            <button onClick={() => window.location.href = '/admin/whatsapp'} className="p-4 bg-white rounded-xl border border-[#E5E5E1] hover:border-[#3ECF8E] transition-colors text-center">
              <MessageSquare className="w-6 h-6 mx-auto text-[#3ECF8E] mb-2" />
              <span className="text-xs font-medium">WhatsApp</span>
            </button>
            <button onClick={() => window.location.href = '/admin/settings'} className="p-4 bg-white rounded-xl border border-[#E5E5E1] hover:border-[#3ECF8E] transition-colors text-center">
              <BookOpen className="w-6 h-6 mx-auto text-[#3ECF8E] mb-2" />
              <span className="text-xs font-medium">Settings</span>
            </button>
          </div>

          {/* Documentation */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Documentation</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => window.location.href = '/admin/docs'}>
                  View All <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <button onClick={() => window.location.href = '/admin/docs'} className="w-full flex items-center justify-between p-3 rounded-lg border border-[#E5E5E1] hover:bg-[#F3F3F1] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#3ECF8E]/10 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-[#3ECF8E]" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">Standard Operating Procedures</p>
                    <p className="text-xs text-[#717171]">SOPs and protocols</p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-[#717171]" />
              </button>
              <button onClick={() => window.location.href = '/admin/hr'} className="w-full flex items-center justify-between p-3 rounded-lg border border-[#E5E5E1] hover:bg-[#F3F3F1] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#3ECF8E]/10 flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-[#3ECF8E]" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">HR Guidelines</p>
                    <p className="text-xs text-[#717171]">Employee policies</p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-[#717171]" />
              </button>
            </CardContent>
          </Card>

          {/* FAQ */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {FAQS.map((faq, idx) => (
                <div key={idx} className="border border-[#E5E5E1] rounded-lg overflow-hidden">
                  <button 
                    onClick={() => setExpandedFAQ(expandedFAQ === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-3 hover:bg-[#F3F3F1] transition-colors"
                  >
                    <span className="text-sm text-left">{faq.question}</span>
                    <ChevronRight className={`w-4 h-4 text-[#717171] transition-transform ${expandedFAQ === idx ? 'rotate-90' : ''}`} />
                  </button>
                  {expandedFAQ === idx && (
                    <div className="px-3 pb-3">
                      <p className="text-xs text-[#717171]">{faq.answer}</p>
                      <Badge className="mt-2 bg-[#F3F3F1] text-[#717171] text-[10px]">{faq.category}</Badge>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Tickets */}
          {recentTickets.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Recent Support Tickets</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => window.location.href = '/admin/tickets'}>
                    View All <ChevronRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {recentTickets.map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between p-3 bg-[#F3F3F1] rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{ticket.subject}</p>
                      <p className="text-xs text-[#717171]">{new Date(ticket.created_at).toLocaleDateString()}</p>
                    </div>
                    <Badge className={ticket.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100'}>
                      {ticket.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Contact Support Card */}
          <Card className="bg-gradient-to-br from-[#3ECF8E]/10 to-[#3ECF8E]/5 border-[#3ECF8E]/20">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#3ECF8E]/20 flex items-center justify-center mx-auto">
                <LifeBuoy className="w-6 h-6 text-[#3ECF8E]" />
              </div>
              <div>
                <p className="font-medium">Need Help?</p>
                <p className="text-xs text-[#717171]">Our team is here to assist you</p>
              </div>
              <Button className="w-full bg-[#3ECF8E] hover:bg-[#34b27b] text-black" onClick={() => setShowContact(true)}>
                <MessageCircle className="w-4 h-4 mr-2" />
                Contact Support
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardContent className="space-y-2 p-4">
              <button onClick={() => setShowFeedback(true)} className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-[#F3F3F1] transition-colors">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-4 h-4 text-[#717171]" />
                  <span className="text-sm">Send Feedback</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#717171]" />
              </button>
              <button className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-[#F3F3F1] transition-colors">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-4 h-4 text-[#717171]" />
                  <span className="text-sm">Training Videos</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#717171]" />
              </button>
              <button className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-[#F3F3F1] transition-colors">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-[#717171]" />
                  <span className="text-sm">Emergency Contact</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#717171]" />
              </button>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#3ECF8E]" />
                <span className="text-sm">+975 17268753</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#3ECF8E]" />
                <span className="text-sm">support@innovates.bt</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Contact Support Modal */}
      <Dialog open={showContact} onOpenChange={setShowContact}>
        <DialogContent className="bg-white border-[#E5E5E1]">
          <DialogHeader>
            <DialogTitle>Contact Support</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-xs text-[#717171]">Subject</label>
              <Input 
                value={contactForm.subject}
                onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                placeholder="Brief description of your issue"
                className="bg-[#F3F3F1] border-[#E5E5E1]"
              />
            </div>
            <div>
              <label className="text-xs text-[#717171]">Priority</label>
              <div className="flex gap-2 mt-1">
                {['low', 'medium', 'high'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setContactForm({...contactForm, priority: p})}
                    className={`px-3 py-1 rounded text-xs ${
                      contactForm.priority === p 
                        ? 'bg-[#3ECF8E] text-black' 
                        : 'bg-[#F3F3F1] text-[#717171]'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-[#717171]">Message</label>
              <Textarea 
                value={contactForm.message}
                onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                placeholder="Describe your issue in detail..."
                className="bg-[#F3F3F1] border-[#E5E5E1] h-24"
              />
            </div>
            <Button 
              className="w-full bg-[#3ECF8E] text-black"
              onClick={submitContact}
              disabled={submitting}
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
              Submit Ticket
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Feedback Modal */}
      <Dialog open={showFeedback} onOpenChange={setShowFeedback}>
        <DialogContent className="bg-white border-[#E5E5E1]">
          <DialogHeader>
            <DialogTitle>Send Feedback</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-xs text-[#717171]">Type</label>
              <div className="flex gap-2 mt-1">
                {['suggestion', 'bug', 'compliment'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setFeedbackForm({...feedbackForm, type: t})}
                    className={`px-3 py-1 rounded text-xs capitalize ${
                      feedbackForm.type === t 
                        ? 'bg-[#3ECF8E] text-black' 
                        : 'bg-[#F3F3F1] text-[#717171]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-[#717171]">Your Feedback</label>
              <Textarea 
                value={feedbackForm.message}
                onChange={(e) => setFeedbackForm({...feedbackForm, message: e.target.value})}
                placeholder="Tell us how we can improve..."
                className="bg-[#F3F3F1] border-[#E5E5E1] h-24"
              />
            </div>
            <Button 
              className="w-full bg-[#3ECF8E] text-black"
              onClick={submitFeedback}
              disabled={submitting}
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
              Submit Feedback
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}