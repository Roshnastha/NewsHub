"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Mail, Cloud, DollarSign, Users } from "lucide-react";
import { useNews } from "@/app/context/NewsContext";
import { useRouter } from "next/navigation";
import styles from "./Sidebar.module.css";

const NEPSE_SYMBOLS = ["NABIL", "NICA", "HIDCL", "EBL", "NLIC"];

interface StockData {
  symbol: string;
  price: string;
  change: string;
  positive: boolean;
}

interface WeatherData {
  temp: number;
  condition: string;
  high: number;
  low: number;
}

interface GoldSilverData {
  gold: string;
  silver: string;
  goldChange: string;
  silverChange: string;
}

interface MetalSpotEntry {
  gold?: number;
  silver?: number;
}

export default function Sidebar() {
  const { dbArticles } = useNews();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [goldSilver, setGoldSilver] = useState<GoldSilverData | null>(null);
  const [loadingStocks, setLoadingStocks] = useState(true);
  const [loadingGold, setLoadingGold] = useState(true);

  // Fetch weather for Kathmandu
  useEffect(() => {
    fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=27.7172&longitude=85.3240&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=Asia/Kathmandu&forecast_days=1",
    )
      .then((r) => r.json())
      .then((data) => {
        const code = data.current.weather_code;
        const condition =
          code === 0
            ? "Clear Sky"
            : code <= 3
              ? "Partly Cloudy"
              : code <= 48
                ? "Foggy"
                : code <= 67
                  ? "Rainy"
                  : code <= 77
                    ? "Snowy"
                    : "Thunderstorm";
        setWeather({
          temp: Math.round(data.current.temperature_2m),
          condition,
          high: Math.round(data.daily.temperature_2m_max[0]),
          low: Math.round(data.daily.temperature_2m_min[0]),
        });
      })
      .catch(console.error);
  }, []);

  // Fetch NEPSE stocks
  useEffect(() => {
    const fetchStocks = async () => {
      setLoadingStocks(true);
      try {
        const results = await Promise.all(
          NEPSE_SYMBOLS.map((symbol) =>
            fetch(
              `https://nepsetty.kokomo.workers.dev/api?symbol=${symbol}`,
            ).then((r) => r.json()),
          ),
        );
        const formatted = results.map((data, i) => {
          const change = data.percentageChange ?? data.change ?? 0;
          const positive = parseFloat(change) >= 0;
          return {
            symbol: NEPSE_SYMBOLS[i],
            price: `Rs.${data.lastTradedPrice ?? data.price ?? "N/A"}`,
            change: `${positive ? "+" : ""}${parseFloat(change).toFixed(2)}%`,
            positive,
          };
        });
        setStocks(formatted);
      } catch {
        setStocks([
          { symbol: "NABIL", price: "Rs.539", change: "+1.2%", positive: true },
          { symbol: "NICA", price: "Rs.398", change: "+1.0%", positive: true },
          { symbol: "HIDCL", price: "Rs.301", change: "+2.0%", positive: true },
          { symbol: "EBL", price: "Rs.714", change: "-0.5%", positive: false },
          { symbol: "NLIC", price: "Rs.890", change: "+0.8%", positive: true },
        ]);
      } finally {
        setLoadingStocks(false);
      }
    };
    fetchStocks();
  }, []);

  // Fetch gold/silver with live USD→NPR rate
  useEffect(() => {
    const fetchGoldSilver = async () => {
      setLoadingGold(true);
      try {
        const [metalsRes, rateRes] = await Promise.all([
          fetch("https://api.metals.live/v1/spot"),
          fetch("https://api.exchangerate-api.com/v4/latest/USD"),
        ]);

        const metalsData: MetalSpotEntry[] = await metalsRes.json();
        const rateData = await rateRes.json();
        const NPR_RATE: number = rateData.rates?.NPR ?? 133;

        const goldUSD = metalsData.find((m) => m.gold)?.gold ?? 0;
        const silverUSD = metalsData.find((m) => m.silver)?.silver ?? 0;

        // Convert: USD/troy oz → NPR/tola (1 tola = 11.66g, 1 troy oz = 31.1g)
        const goldPerTola = ((goldUSD / 31.1) * 11.66 * NPR_RATE).toFixed(0);
        const silverPerTola = ((silverUSD / 31.1) * 11.66 * NPR_RATE).toFixed(
          0,
        );

        setGoldSilver({
          gold: `Rs.${parseInt(goldPerTola).toLocaleString()}`,
          silver: `Rs.${parseInt(silverPerTola).toLocaleString()}`,
          goldChange: "+0.3%",
          silverChange: "+0.1%",
        });
      } catch {
        setGoldSilver({
          gold: "Rs.1,42,500",
          silver: "Rs.1,650",
          goldChange: "+0.3%",
          silverChange: "+0.1%",
        });
      } finally {
        setLoadingGold(false);
      }
    };
    fetchGoldSilver();
  }, []);

  // Trending topics from DB articles
  const trendingTopics = (() => {
    const categoryCount: Record<string, number> = {};
    dbArticles.forEach((a) => {
      const cat = a.category;
      if (cat) categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    });
    return Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([topic, posts]) => ({ topic, posts }));
  })();

  // Popular articles from DB
  const popularArticles = dbArticles.slice(0, 3).map((a) => ({
    title: a.title,
    readTime: "3 min read",
    views: "0",
    id: a.id,
  }));

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const subs = JSON.parse(localStorage.getItem("subscribers") || "[]");
    if (!subs.includes(email)) {
      subs.push(email);
      localStorage.setItem("subscribers", JSON.stringify(subs));
    }
    setSubscribed(true);
    setEmail("");
    setTimeout(() => setSubscribed(false), 3000);
  };

  const handleShare = (platform: string) => {
    const url = encodeURIComponent(window.location.href);
    const links: Record<string, string> = {
      Twitter: `https://twitter.com/intent/tweet?url=${url}&text=Check out NewsHub!`,
      Facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      LinkedIn: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      Instagram: `https://www.instagram.com/`,
    };
    window.open(links[platform], "_blank");
  };

  return (
    <aside className={styles.sidebar}>
      {/* Weather Widget */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>
            <Cloud className={styles.cardIcon} />
            <span>Weather — Kathmandu</span>
          </h3>
        </div>
        <div className={styles.cardContent}>
          <div className={styles.weatherWidget}>
            <div className={styles.weatherValue}>
              {weather ? `${weather.temp}°C` : "..."}
            </div>
            <div className={styles.weatherCondition}>
              {weather?.condition ?? "Loading..."}
            </div>
            <div className={styles.weatherGrid}>
              <div className={styles.weatherItem}>
                <div className={styles.weatherLabel}>High</div>
                <div className={styles.weatherData}>
                  {weather ? `${weather.high}°C` : "--"}
                </div>
              </div>
              <div className={styles.weatherItem}>
                <div className={styles.weatherLabel}>Low</div>
                <div className={styles.weatherData}>
                  {weather ? `${weather.low}°C` : "--"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>
            <Mail className={styles.cardIcon} />
            <span>Newsletter</span>
          </h3>
        </div>
        <div className={styles.cardContent}>
          <p className={styles.formDescription}>
            Get the latest news delivered to your inbox daily.
          </p>
          {subscribed ? (
            <p
              style={{ color: "#22c55e", fontWeight: 600, textAlign: "center" }}
            >
              ✓ Subscribed successfully!
            </p>
          ) : (
            <form
              onSubmit={handleNewsletterSubmit}
              className={styles.newsletterForm}
            >
              <input
                type="email"
                className={styles.formInput}
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" className={styles.submitButton}>
                Subscribe Now
              </button>
            </form>
          )}
          <p className={styles.formNote}>
            Join 50,000+ subscribers. Unsubscribe anytime.
          </p>
        </div>
      </div>

      {/* Trending Topics */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>
            <TrendingUp className={styles.cardIcon} />
            <span>Trending Topics</span>
          </h3>
        </div>
        <div className={styles.cardContent}>
          <div className={styles.topicsList}>
            {trendingTopics.map((item, index) => (
              <div key={item.topic} className={styles.topicItem}>
                <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
                  <span className={styles.topicNumber}>#{index + 1}</span>
                  <span className={styles.topicName}>{item.topic}</span>
                </div>
                <div className={styles.topicCount}>{item.posts}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* NEPSE Market Watch */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>
            <DollarSign className={styles.cardIcon} />
            <span>NEPSE Market Watch</span>
          </h3>
        </div>
        <div className={styles.cardContent}>
          {loadingStocks ? (
            <p
              style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}
            >
              Loading...
            </p>
          ) : (
            <div className={styles.stockList}>
              {stocks.map((stock) => (
                <div key={stock.symbol} className={styles.stockItem}>
                  <div className={styles.stockInfo}>
                    <div className={styles.stockSymbol}>{stock.symbol}</div>
                    <div className={styles.stockPrice}>{stock.price}</div>
                  </div>
                  <div
                    className={`${styles.stockChange} ${stock.positive ? styles.positive : styles.negative}`}
                  >
                    {stock.change}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Gold & Silver */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>
            <span style={{ fontSize: "1.2rem" }}>🪙</span>
            <span>Gold & Silver — Nepal</span>
          </h3>
        </div>
        <div className={styles.cardContent}>
          {loadingGold ? (
            <p
              style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}
            >
              Loading...
            </p>
          ) : (
            <div className={styles.stockList}>
              <div className={styles.stockItem}>
                <div className={styles.stockInfo}>
                  <div className={styles.stockSymbol}>🥇 Gold/Tola</div>
                  <div className={styles.stockPrice}>
                    {goldSilver?.gold ?? "..."}
                  </div>
                </div>
                <div className={`${styles.stockChange} ${styles.positive}`}>
                  {goldSilver?.goldChange ?? ""}
                </div>
              </div>
              <div className={styles.stockItem}>
                <div className={styles.stockInfo}>
                  <div className={styles.stockSymbol}>🥈 Silver/Tola</div>
                  <div className={styles.stockPrice}>
                    {goldSilver?.silver ?? "..."}
                  </div>
                </div>
                <div className={`${styles.stockChange} ${styles.positive}`}>
                  {goldSilver?.silverChange ?? ""}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Popular This Week */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>
            <Users className={styles.cardIcon} />
            <span>Popular This Week</span>
          </h3>
        </div>
        <div className={styles.cardContent}>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            {popularArticles.length > 0
              ? popularArticles.map((article, index) => (
                  <div
                    key={index}
                    style={{
                      padding: "8px 0",
                      borderBottom: "1px solid var(--color-border)",
                      cursor: "pointer",
                    }}
                    onClick={() => router.push(`/news/${article.id}`)}
                  >
                    <h4
                      style={{
                        margin: 0,
                        marginBottom: "4px",
                        fontSize: "var(--font-size-sm)",
                        fontWeight: "var(--font-weight-600)",
                        color: "var(--color-text-primary)",
                      }}
                    >
                      {article.title}
                    </h4>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "var(--font-size-xs)",
                        color: "var(--color-text-muted)",
                      }}
                    >
                      <span>{article.readTime}</span>
                      <span>{article.views} views</span>
                    </div>
                  </div>
                ))
              : [
                  {
                    title: "The Future of Work in AI Era",
                    readTime: "7 min read",
                    views: "12.3k",
                  },
                  {
                    title: "Understanding Quantum Physics",
                    readTime: "5 min read",
                    views: "8.7k",
                  },
                  {
                    title: "Sustainable Living Guide",
                    readTime: "9 min read",
                    views: "6.2k",
                  },
                ].map((article, index) => (
                  <div
                    key={index}
                    style={{
                      padding: "8px 0",
                      borderBottom: "1px solid var(--color-border)",
                    }}
                  >
                    <h4
                      style={{
                        margin: 0,
                        marginBottom: "4px",
                        fontSize: "var(--font-size-sm)",
                        fontWeight: "var(--font-weight-600)",
                        color: "var(--color-text-primary)",
                      }}
                    >
                      {article.title}
                    </h4>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "var(--font-size-xs)",
                        color: "var(--color-text-muted)",
                      }}
                    >
                      <span>{article.readTime}</span>
                      <span>{article.views} views</span>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </div>

      {/* Social Media */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Follow Us</h3>
        </div>
        <div className={styles.cardContent}>
          <div className={styles.socialGrid}>
            {["Twitter", "Facebook", "LinkedIn", "Instagram"].map(
              (platform) => (
                <button
                  key={platform}
                  className={styles.socialButton}
                  onClick={() => handleShare(platform)}
                >
                  {platform}
                </button>
              ),
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
