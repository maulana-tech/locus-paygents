import { useEffect } from "react";
import { motion } from "motion/react";
import { ArrowRight, Mail, Twitter, Linkedin, Instagram, Github } from "lucide-react";
import { Link } from "react-router-dom";
import Lenis from "lenis";

const Navbar = () => (
  <nav className="fixed top-0 w-full flex justify-between items-center px-8 py-6 bg-surface/80 backdrop-blur-xl z-50 border-b border-outline-variant/10">
    <div className="text-2xl font-bold tracking-tighter text-white uppercase font-body">LCusAgent</div>
    <div className="hidden md:flex gap-8 items-center font-label text-sm font-medium">
      <Link className="text-secondary border-b-2 border-secondary pb-1" to="/">Home</Link>
      <a className="text-white hover:text-primary transition-colors duration-200" href="#">Newsletter</a>
      <a className="text-white hover:text-primary transition-colors duration-200" href="#">Podcast</a>
      <a className="text-white hover:text-primary transition-colors duration-200" href="#">About</a>
      <Link className="text-white hover:text-primary transition-colors duration-200" to="/simulation">Simulation</Link>
    </div>
    <button className="bg-primary text-black px-6 py-2 text-xs font-bold tracking-widest hover:bg-primary-dim transition-all active:scale-95 duration-100">
      LET'S BE FRENS!
    </button>
  </nav>
);

const Hero = () => (
  <section className="relative min-h-screen flex items-center pt-24 overflow-hidden">
    <div className="absolute inset-0 grid-pattern opacity-10 pointer-events-none" />
    <div className="container mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 items-center gap-12 relative z-10">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-6xl md:text-8xl font-headline font-light leading-tight tracking-tight text-white mb-8">
          The first autonomous AI agent economy <span className="italic text-primary">simulation</span>
        </h1>
        <div className="flex gap-4">
          <button className="bg-secondary text-on-secondary px-8 py-4 text-lg font-bold hover:brightness-110 transition-all active:scale-95">
            Let's be frens!
          </button>
          <Link to="/simulation" className="bg-primary text-black px-8 py-4 text-lg font-bold hover:brightness-110 transition-all active:scale-95 flex items-center gap-2">
            Launch Simulation <ArrowRight size={20} />
          </Link>
        </div>
      </motion.div>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="relative"
      >
        <img 
          className="w-full h-auto aspect-square object-contain" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDxLhSXOlT4j3-oGnMrgwLe9ejTnuqVFcYJKUoxuueoqHpYCf_HWMUQBMc4DkJVPFGhdwZA_78D2QMB-IU5w-aN4dNoKe1f4BuwbfTJ7QCUKSqcD0P40pzkQFX6g1XE9e-wiGdNH3rjKhujUsbjBMqgobBZHF3x6PX5JuVgYXHN8f-bZPV8CQ47C2_jZ6OoOf-o4snBAsSEaYwK_l2o2rTifAY4dQhgT0q_OQcdZsE5rf7mdLh7qb7W52EqbGoBcB15wMmRTU-wV6c" 
          alt="Abstract 3D geometric composition"
          referrerPolicy="no-referrer"
        />
      </motion.div>
    </div>
  </section>
);

const Marquee = () => (
  <div className="bg-primary py-6 overflow-hidden border-y border-outline-variant/20">
    <div className="flex whitespace-nowrap animate-marquee">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center gap-8 px-4 font-bold text-3xl md:text-4xl text-black tracking-widest uppercase">
          <span>VISUAL COMMERCE</span>
          <span className="text-white">•</span>
          <span>SIMULATE ECONOMY</span>
          <span className="text-white">•</span>
        </div>
      ))}
    </div>
  </div>
);

const ServiceRow = ({ image, title, subtitle, description, tag, reverse = false }: any) => (
  <div className="grid grid-cols-1 md:grid-cols-2 border-b border-outline-variant/30">
    <div className={`p-12 md:p-24 flex items-center justify-center ${reverse ? 'md:order-2' : 'border-r border-outline-variant/30'} bg-surface-container-low/50`}>
      <motion.img 
        whileHover={{ scale: 1.05 }}
        className="w-full max-w-md h-auto object-contain" 
        src={image} 
        alt={title}
        referrerPolicy="no-referrer"
      />
    </div>
    <div className={`p-12 md:p-24 flex flex-col justify-center ${reverse ? 'md:order-1 border-r border-outline-variant/30' : ''}`}>
      <span className={`${reverse ? 'text-secondary' : 'text-primary'} font-label font-bold tracking-[0.2em] text-sm mb-6 uppercase`}>
        {tag}
      </span>
      <h3 className="text-5xl md:text-7xl font-headline mb-8 text-white leading-tight">
        {title}
      </h3>
      <p className="text-gray-400 text-xl md:text-2xl font-body leading-relaxed max-w-xl">
        {description}
      </p>
    </div>
  </div>
);

const Partners = () => (
  <section className="py-24 bg-surface-container-low border-y border-outline-variant/20 overflow-hidden relative">
    <div className="container mx-auto px-8 relative z-10 text-center">
      <h2 className="text-4xl md:text-5xl font-headline text-white mb-20 max-w-3xl mx-auto">
        Co-creating the next stream of internet companies
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-12 items-center opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
        {[
          "https://lh3.googleusercontent.com/aida-public/AB6AXuCKt6_7rZEcqJJZUi5JZT9nkFyIci7nWDrGkaLSp__0niewRVP5VPpmk2DDYbzkt5bE9pvwCDXfOQYjgtiupNBOrFf7zWhWJubGM_rlaKgsFIYFfQ3T9UjVsh7ImC0NZkYFJrVKuYCbXwBBtFyZctJYZV3plR0uzeM1sEZ1T1y2xo7SFASbJMPK3NPJo_sNIMommaFzmWPR7_KKcIByLLEVqzRYvCWNGPiyaEcaTNbxHIG20mmWyAvUQ_ADh8d6KZLw3BqmjZxHyeA",
          "https://lh3.googleusercontent.com/aida-public/AB6AXuAJe0_8D4B9iOR8s4IfbE70XRL3899eiFRigbhdhXLGFl6MAMRmyFzRJOnIhmuRPSjqR07Y2rALLXrkntDLXMbmxtZLJVk1V7ieApcuwPH6A3kg2IcsaZIkWrx8piZY99iI_m5bySrnsbhxSeCLgjRma7ioYf8sVcyd1KdD3FQfUT2j5J2-55M2HWkz7FwI3YgLu3xQHdaLZ0EZUzaltjkhrs2YFH8kNZMa3UzfV1DEjhImJgAD5KUg8lFWB209rNtcX2T_Bz5PdmU",
          "https://lh3.googleusercontent.com/aida-public/AB6AXuBAuK5XxtG48Xh5Tk7rf3DgNuxvRDotzqI1DRH_dTtt-Ijd1fiC4Z9qQKp3fV1adUApEODvbiYncFQLuKnfsGtnr_4SXe8kazfhabPlSulr9WWgxoffeawolXGV5-o9X7Ng99PpNNawk6nvQqsz4I3uqjOFGYkitrdA9JhVhn5g0W296E3g9vF-0jWkFpGqqNU2OTFS4SXnwZ7BIlk6Mm_EviatzbEdPOMy_M-p1nKesj37C911DCdsEy3GQNuj68DdqSggp-BqBRo",
          "https://lh3.googleusercontent.com/aida-public/AB6AXuC1SFiLBck0CLR754NCKG6T1RT_wD7H6faEb6AAvVAXDTtvna4dm6Byuwt1PC2lOhYS4DUjBNMPEhBcjL3U9EMPxbeveHTmN4IcjDDssqBRxOsQBNTpSC0-f0Fu_mmmhyM0tv06yeMBI7XnRzoQSFDkKjkwcKu9G658aGP4ychikwQCghY_1Negkc61vbBE1DAYMN8hNYCQ0wbcxvE5vXguuwEu5ryYAx40dmCl8k0QowRgj1S1ZmxxidQbX2hrTEjTALKzjZvzneo",
          "https://lh3.googleusercontent.com/aida-public/AB6AXuDhD3sO8tvgmXbzoEIX5Z49JKo7B8Zg0wLm8Gr4GTxih8JF2eZSquRBCxejgcRDlvCBDk9IOmDQTNvcA6EIm2iuZ9Jk93MlM7v4Xqy9vi5AuiWMlSpTLn-ZvTg0-I7FOrifNDjPUOFARBc2g8RrbIoIhS5m3wd-sWGf3tCkov9LPfvzmTnOe1L83o5VQKbiMj4rtIseNqBtVNjpNM0_TJgOTfyRGxfdmIwNNq2uHgFl8bNjt5F6goETf8ZiYa8OHT-0yb4zoQLzgGI"
        ].map((src, i) => (
          <img key={i} className="h-8 mx-auto object-contain" src={src} alt="Partner Logo" referrerPolicy="no-referrer" />
        ))}
      </div>
      <div className="mt-20 flex justify-center">
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="relative inline-block"
        >
          <img 
            className="max-w-md rounded-none" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCPXyX-TB6O42RBV9yZD-6GHpJHgJ9QtVTcywwFM-LGZ-xNC2MxIl_8A-NQKDksuHl3G5edPCxIqPEdjonBFUa5M1FOZKN0oudIDw4TtBN3bWYj5KQtOzrEx4pGHVsMOvbaqsBDfzR1kEc8XIrH4vKFtQ7hmOYLbDri0Y5licu2kkjDn7kJJC1hn6t_ddtBU-rFynmBeKlDMMm76isck8bKkD4YQTWaYxZlNoMJCX-iQT-UKSS78BUYVfFOBFIATfMO6KcmCyeL8GQ" 
            alt="Retro computer"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-secondary/10 mix-blend-screen pointer-events-none" />
        </motion.div>
      </div>
    </div>
  </section>
);

const Newsletter = () => (
  <section className="py-24 bg-surface">
    <div className="container mx-auto px-8">
      <div className="bg-surface-container border border-outline-variant/40 p-1 md:p-4">
        <div className="bg-[#e5e5e5] p-12 relative overflow-hidden text-black">
          <div className="absolute top-0 left-0 w-0 h-0 border-t-[60px] border-t-surface border-r-[60px] border-r-transparent" />
          <div className="absolute top-0 right-0 w-0 h-0 border-t-[60px] border-t-surface border-l-[60px] border-l-transparent" />
          <div className="flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
            <div className="max-w-lg">
              <span className="font-label text-sm font-bold tracking-widest text-primary-dim uppercase mb-4 block">Newsletter</span>
              <h2 className="text-5xl md:text-6xl font-headline mb-6 leading-tight">This Week in WEB3</h2>
              <p className="font-body text-black/70 text-lg leading-relaxed mb-8">Get the latest insights on design, tech, and the ownership economy. No spam, just deep dives.</p>
              <div className="flex flex-col sm:flex-row gap-0 border-2 border-black">
                <input className="bg-transparent border-none focus:ring-0 text-black p-4 flex-grow placeholder:text-black/40 font-label" placeholder="YOUR EMAIL ADDRESS" type="email" />
                <button className="bg-black text-white px-8 py-4 font-bold hover:bg-gray-800 transition-all">SUBSCRIBE</button>
              </div>
            </div>
            <div className="w-full md:w-1/3">
              <img 
                className="w-full" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA9AyRoLTm_YOCA67qh5DGy-Q-9Uti5yoy9N8EFC2-ngmM7VLWfUILJ1gpz17K9HAKUNNeKHTu4NrjSlnTLgraSPnqrhjz9iVjSlk6EEsw1lm8yVf8V9byNSIhmt39I3MfzLgy6-Ql8FVCK4OulVAoExYD4nwRF6l8IJ73_fQEUaKa9QiYP5BTc5UHfck5hvMMipYYyukg8M-OKMPx89TB7itptuW-VdWncVRpdumQ9c1iQ1m301RxAgxvz5ptT8kAzf3G7hiPnYjQ" 
                alt="Digital envelope"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const Team = () => (
  <section className="py-24 bg-surface-container-low">
    <div className="container mx-auto px-8">
      <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
        <h2 className="text-6xl md:text-8xl font-headline text-white leading-tight uppercase">
          THE<br />LCusAgent<br />SQUAD
        </h2>
        <a href="#" className="text-primary font-bold text-lg font-label border-b border-primary pb-2 hover:text-white hover:border-white transition-all">
          Intro THE SQUAD
        </a>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
        {[
          { name: "Lana", role: "Lead Developer", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBFDORYHD_7w5kIfqeVitiWvqWSrbKIeCJBVLnUs99cwIJYajOhmZUeez1NNSuy3eYc86Q0yQdjngXEdEa8ZOlaA1bq87JQXma6V5rfuH-4GoF2XZSHYoas7iWS-c7kpmmW_uruptyfgoXfrsc7MZCed2NRfD5jTzMJWBCMmFC9vJEjDw0P5ZlvNqxnLsFW_qxeAKOai_p0VvqDAmVtOVHwWBqdcuaxwztdL1pGZHEnbRnDwhMVfGTrNm8fd-28nZSJwUnIDebUcyE" },
          { name: "Catur", role: "Fullstack Developer", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDoenBFnWG98PSXvak3Jv8wvBx6j9CPNHhXe3tOo4rjR90JZQGXcU3Kb--3xg87L32QHWkXzefnOIW8VkP9xtWzRy1F4Mp4eUJIqwsD7idcIWwv_2_BXCQvCRqRd9MADwsgLVv3gx_tAK3urkw2afYG1p1KrFli_MMhY1lP78lSF48j9MqXtLbf71k35W4FB7uJ9w-U8YF86mGnw1y1o4twfdq66DFQvl1e2NNPBXkLqPgrYg6niVDu7JN8MASBnpf9dgMMHmXiBes" },
        ].map((member, i) => (
          <motion.div 
            key={i} 
            whileHover={{ y: -10 }}
            className="text-center group"
          >
            <div className="bg-surface-container mb-6 aspect-square overflow-hidden border border-outline-variant/20 group-hover:border-primary transition-all duration-300">
              <img className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" src={member.img} alt={member.name} referrerPolicy="no-referrer" />
            </div>
            <h4 className="font-bold text-white text-xl">{member.name}</h4>
            <p className="text-gray-500 font-label text-xs uppercase tracking-widest mt-1">{member.role}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const Contact = () => (
  <section className="py-24 bg-surface">
    <div className="container mx-auto px-8 max-w-5xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-24">
        <div>
          <h2 className="text-6xl md:text-7xl font-headline text-white mb-8">Ready to initiate?</h2>
          <p className="text-gray-400 text-xl leading-relaxed font-body">Drop us a line and let's discuss how we can build the future of the internet together.</p>
          <div className="mt-12 space-y-4">
            <p className="text-secondary font-bold font-label text-lg">HELLO@LCusAgent.XYZ</p>
            <p className="text-white font-label tracking-widest uppercase">Yogyakarta, Indonesia</p>
          </div>
        </div>
        <div className="bg-white p-12 text-black">
          <form className="space-y-10" onSubmit={(e) => e.preventDefault()}>
            <div className="relative">
              <label className="block font-label text-[10px] font-bold uppercase tracking-[0.2em] mb-2 text-black/40">Full Name</label>
              <input className="w-full bg-transparent border-0 border-b border-black/20 focus:border-secondary focus:ring-0 p-0 pb-2 text-black font-headline text-2xl placeholder:text-black/10" placeholder="John Doe" type="text" />
            </div>
            <div className="relative">
              <label className="block font-label text-[10px] font-bold uppercase tracking-[0.2em] mb-2 text-black/40">Email</label>
              <input className="w-full bg-transparent border-0 border-b border-black/20 focus:border-secondary focus:ring-0 p-0 pb-2 text-black font-headline text-2xl placeholder:text-black/10" placeholder="john@company.com" type="email" />
            </div>
            <div className="relative">
              <label className="block font-label text-[10px] font-bold uppercase tracking-[0.2em] mb-2 text-black/40">Message</label>
              <textarea className="w-full bg-transparent border-0 border-b border-black/20 focus:border-secondary focus:ring-0 p-0 pb-2 text-black font-headline text-2xl placeholder:text-black/10 resize-none" placeholder="Tell us about your project..." rows={3} />
            </div>
            <button className="w-full bg-black text-white py-6 text-xl font-bold hover:bg-gray-800 transition-all active:scale-95">
              Full Power. Go!
            </button>
          </form>
        </div>
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="bg-surface-container-low border-t border-outline-variant/20 pt-24 pb-12">
    <div className="container mx-auto px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
        <div>
          <div className="text-4xl font-bold tracking-tighter text-secondary uppercase mb-8 font-body">LCusAgent</div>
          <p className="text-gray-400 max-w-sm font-body leading-relaxed text-lg">
            An economy simulation built for the next evolution of human coordination and autonomous expression.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h5 className="font-label text-white font-bold uppercase mb-6 tracking-widest text-sm">Connect</h5>
            <ul className="space-y-4 text-gray-400 font-label">
              <li><a className="hover:text-white transition-all flex items-center gap-2" href="#"><Twitter size={16} /> Twitter</a></li>
              <li><a className="hover:text-white transition-all flex items-center gap-2" href="#"><Linkedin size={16} /> LinkedIn</a></li>
              <li><a className="hover:text-white transition-all flex items-center gap-2" href="#"><Instagram size={16} /> Instagram</a></li>
              <li><a className="hover:text-white transition-all flex items-center gap-2" href="#"><Mail size={16} /> Discord</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-label text-white font-bold uppercase mb-6 tracking-widest text-sm">Explore</h5>
            <ul className="space-y-4 text-gray-400 font-label">
              <li><a className="hover:text-white transition-all" href="#">Projects</a></li>
              <li><a className="hover:text-white transition-all" href="#">Mirror</a></li>
              <li><a className="hover:text-white transition-all" href="#">GitHub</a></li>
              <li><a className="hover:text-white transition-all" href="#">Careers</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="flex flex-col md:flex-row justify-between items-center border-t border-outline-variant/10 pt-12 text-gray-500 font-label text-[10px] tracking-[0.3em] uppercase">
        <p>© 2026 LCusAgent. ALL RIGHTS RESERVED.</p>
        <p>MADE IN Fivee Team</p>
      </div>
    </div>
  </footer>
);

export function Landing() {
  useEffect(() => {
    // Initialize Lenis for smooth scrolling
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <div className="min-h-screen bg-surface selection:bg-secondary selection:text-black">
      <Navbar />
      <Hero />
      <Marquee />
      <section className="bg-surface">
        <ServiceRow 
          tag="Autonomous Economy"
          title="Self-governing Agents"
          description="Agents operate as workers in a 3D isometric environment, managing their own financial operations using Locus smart wallets."
          image="https://lh3.googleusercontent.com/aida-public/AB6AXuAOwF-2HFpG5PmmZI1gXGz-UWryqYfcDSWCmkQ5JmWKb2L7XrwGeue2KtfBMF0xTHHYAOl5dFidPLA2tY8vRCGSyr8niPaHOC2YQJWOXaDqMs9Ovc-95QIk3QxN8kg6wslQ76Ed0ehs1Wudzh65ldhaUO3su4BFL_bqoC2esVQLwab07ybWSVH3QJCJl7SQk3mpLdu5xcV-AkS68FC-OgZMnSj2QOhAcTLPHIrZO1vw4bD5O6uphn42ybeUw67xcupbG1Wca-0W3Zg"
        />
        <ServiceRow 
          tag="Visual Commerce"
          title="See the money flow"
          description="Real-time USDC transactions between agents are visualized as animated pulses, making the autonomous economy tangible."
          image="https://lh3.googleusercontent.com/aida-public/AB6AXuCMgm2JLdQxos5r4HtovihITi5nAsKvIlDZvf8elOPOx2SPgox-5YamemM3muqNK25GZeRpMSlu6cMT7LASsLJmgteYNNxzcAyDpJKUof4Es2okC2WULRoh67nzwqEjnwOJTX2zvuPFWfBPtXdyRgLxp1KaWljFVmlt5YY78X-5OOyV0sMS1mkMWuSjdMJVllEnGUHN6bV7b9f13xPL0BNAjYdPYC-57S9Q4r-mxwVitEbopr7hLywKPxeULDEesEUrWIUHPKfbsSU"
          reverse
        />
        <ServiceRow 
          tag="Multi-Agent Ecosystem"
          title="B2B & B2C Interactions"
          description="From consumer-facing interactions to agent-to-agent marketplaces, LCusAgent simulates every layer of a digital economy."
          image="https://lh3.googleusercontent.com/aida-public/AB6AXuAqZqM3pfhApPr-bJA-Wdj5bLQpn3uJnUZPa3Q31T_czLpu6OwllYMrkLEzu35Si-PbyiCbBlAo9M8TY3My6W9b0LaxydhF9haxzOZ0lt13PJuOlFSta0phCbvyAszJ0Doe1FUUxjMbafiisdlmLRFMi8mzQ3V1jMXxWK8LM5agPF3AVcWrOENPpb-EtVAqCPq9aQx-XJjha4_Ahs3J8jXt0jeMgskazBRDiiVgmCwV8J36dbtpuhnQadOXf_pN4ZjSaTolLgW7QKk"
        />
        <ServiceRow 
          tag="Financial Operations"
          title="Automated Treasury"
          description="Treasury agents monitor policy, rebalance budgets, and detect anomalies automatically, ensuring stable economic growth."
          image="https://lh3.googleusercontent.com/aida-public/AB6AXuCfCXwTOovEe92uNJWmUYzlBUrTWlg8jBKEUqaAEyQo7kTT1GOiNEpHk6KqGh_WpN-pahkzZcvJl3PcYi_GVylLrC1BfAcehdPJdFJRAHbnYhf7eSuAnYVeTp4ERpY656ou-KaCTozPrAIbxuO7CYt47poWRpe_Ypcq6WV6wrxSjmR9AOXwiWpNKVFIQsnRVRbHQS-dGiNmS26sakXUcPjdXaEob8rhSoKgOqUyRASDnYTnc4xFss5u2sggNnX_XSfKax1f0V1M6Y"
          reverse
        />
      </section>
      <Partners />
      <Newsletter />
      <Team />
      <Contact />
      <Footer />
    </div>
  );
}
