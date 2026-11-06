"""
==============================================================================
Analytics Helper Utilities (utils.py)
==============================================================================

WHAT IS THIS FILE?
This file contains helper functions that clean, inspect, and classify data
sent by visitors.

KEY CAPABILITIES:
1. `get_client_ip`: Safely discovers the visitor's real IP address, even behind
   Cloudflare CDNs or reverse proxies.
2. `parse_user_agent`: Figures out whether someone is using an iPhone, Mac, Windows PC,
   Chrome, Safari, etc.
3. `classify_referrer`: Determines if someone arrived from Google, LinkedIn, GitHub, or direct entry.
4. `sanitize_url`: Strips sensitive tokens or passwords from web addresses so they never get saved.
"""
import re
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse

# List of sensitive query parameter names that must NEVER be saved in database logs
SENSITIVE_PARAM_NAMES = {
    'token', 'key', 'auth', 'pass', 'password', 'secret', 'session',
    'access_token', 'id_token', 'refresh_token', 'api_key', 'apikey'
}

# Recognized search engine domain names
SEARCH_ENGINES = [
    'google', 'bing', 'duckduckgo', 'yahoo', 'baidu', 'yandex', 'ecosia', 'ask'
]

# Recognized social network domain names
SOCIAL_NETWORKS = [
    'linkedin', 'github', 'twitter', 't.co', 'x.com', 'facebook', 'instagram',
    'reddit', 'youtube', 'threads', 'tiktok', 'discord'
]


def sanitize_url(raw_url: str, max_length: int = 500) -> str:
    """
    Cleans a web address by stripping out any sensitive parameters (like ?token=xyz)
    before it can be stored in the database.
    """
    if not raw_url or not isinstance(raw_url, str):
        return ''
    try:
        parsed = urlparse(raw_url.strip()[:1000])
        if not parsed.netloc and not parsed.path:
            return raw_url.strip()[:max_length]
        
        # If the URL contains query parameters (?key=value), inspect and clean them
        if parsed.query:
            qs = parse_qs(parsed.query, keep_blank_values=True)
            # Remove any parameters matching our sensitive blacklist
            cleaned_qs = {k: v for k, v in qs.items() if k.lower() not in SENSITIVE_PARAM_NAMES}
            new_query = urlencode(cleaned_qs, doseq=True)
            cleaned_url = urlunparse((
                parsed.scheme,
                parsed.netloc,
                parsed.path,
                parsed.params,
                new_query,
                ''
            ))
            return cleaned_url[:max_length]
        return raw_url.strip()[:max_length]
    except Exception:
        return raw_url.strip()[:max_length]


def sanitize_path(raw_path: str, max_length: int = 255) -> str:
    """
    Cleans an internal webpage route (e.g. ensure '/projects' starts with a slash).
    """
    if not raw_path or not isinstance(raw_path, str):
        return '/'
    path = raw_path.strip()
    if not path.startswith('/'):
        path = '/' + path
    return path[:max_length]


def classify_referrer(raw_referrer: str, current_host: str = '') -> tuple[str, str]:
    """
    Analyzes where a visitor came from (the "referrer" website).
    
    Returns a tuple: (category, clean_url)
    Categories:
    - 'direct': Typed the URL directly or clicked a bookmark.
    - 'search': Came from Google, Bing, DuckDuckGo, etc.
    - 'social': Came from LinkedIn, GitHub, Twitter, etc.
    - 'referral': Came from another external blog or website.
    """
    if not raw_referrer or not isinstance(raw_referrer, str):
        return 'direct', ''
    
    clean_ref = sanitize_url(raw_referrer)
    try:
        parsed = urlparse(clean_ref)
        hostname = (parsed.hostname or '').lower()
        if not hostname:
            return 'direct', clean_ref
        
        # If visitor moved within our own site, count it as direct
        if current_host and (hostname == current_host.lower() or hostname.endswith('.' + current_host.lower())):
            return 'direct', clean_ref
        if 'hilpatel.site' in hostname or 'localhost' in hostname:
            return 'direct', clean_ref

        # Check search engines
        if any(engine in hostname for engine in SEARCH_ENGINES):
            return 'search', clean_ref

        # Check social networks
        if any(soc in hostname for soc in SOCIAL_NETWORKS):
            return 'social', clean_ref

        return 'referral', clean_ref
    except Exception:
        return 'referral', clean_ref[:500]


def parse_user_agent(user_agent: str) -> dict:
    """
    Inspects the browser's User-Agent string to determine:
    1. Device type: 'desktop', 'tablet', or 'mobile'
    2. Operating system: 'macOS', 'iOS', 'Windows', 'Android', 'Linux'
    3. Browser: 'Chrome', 'Safari', 'Firefox', 'Edge', 'Opera'
    """
    ua = (user_agent or '').lower()
    
    # 1. Device category
    device = 'desktop'
    if any(k in ua for k in ['ipad', 'tablet', 'playbook', 'silk', 'kindle']):
        device = 'tablet'
    elif any(k in ua for k in ['mobile', 'iphone', 'ipod', 'android', 'blackberry', 'phone', 'opera mini']):
        device = 'mobile'

    # 2. Operating System
    os_name = 'unknown'
    if 'macintosh' in ua or 'mac os' in ua:
        os_name = 'macOS'
    elif 'iphone' in ua or 'ipad' in ua or 'ipod' in ua:
        os_name = 'iOS'
    elif 'windows' in ua:
        os_name = 'Windows'
    elif 'android' in ua:
        os_name = 'Android'
    elif 'linux' in ua:
        os_name = 'Linux'
    elif 'cros' in ua:
        os_name = 'Chrome OS'

    # 3. Browser Family
    browser = 'unknown'
    if 'edg/' in ua or 'edge/' in ua:
        browser = 'Edge'
    elif 'opr/' in ua or 'opera' in ua:
        browser = 'Opera'
    elif 'chrome/' in ua or 'crios/' in ua:
        browser = 'Chrome'
    elif 'safari/' in ua and 'version/' in ua:
        browser = 'Safari'
    elif 'firefox/' in ua or 'fxios/' in ua:
        browser = 'Firefox'
    elif 'samsungbrowser' in ua:
        browser = 'Samsung Internet'

    return {
        'device_category': device,
        'os_category': os_name,
        'browser_category': browser,
    }


def get_client_ip(request) -> str:
    """
    Retrieves the genuine public IP address of the user.
    
    When deployed behind Cloudflare or Render, requests pass through proxy servers.
    The real user IP is forwarded in special HTTP headers:
    1. `CF-Connecting-IP`: Provided by Cloudflare (most trustworthy).
    2. `X-Forwarded-For`: Provided by standard proxies/load balancers.
    3. `REMOTE_ADDR`: Fallback for local development.
    """
    # Cloudflare header takes highest precedence
    cf_ip = request.META.get('HTTP_CF_CONNECTING_IP')
    if cf_ip:
        return cf_ip.strip()

    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0].strip()
        if ip:
            return ip
            
    return request.META.get('REMOTE_ADDR') or ''

