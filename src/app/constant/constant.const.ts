export const vertexShader = `
vec3 mod289(vec3 x)
{
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x)
{
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x)
{
  return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

vec3 fade(vec3 t) {
  return t*t*t*(t*(t*6.0-15.0)+10.0);
}

// Classic Perlin noise, periodic variant
float pnoise(vec3 P, vec3 rep)
{
  vec3 Pi0 = mod(floor(P), rep); // Integer part, modulo period
  vec3 Pi1 = mod(Pi0 + vec3(1.0), rep); // Integer part + 1, mod period
  Pi0 = mod289(Pi0);
  Pi1 = mod289(Pi1);
  vec3 Pf0 = fract(P); // Fractional part for interpolation
  vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;

  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);

  vec4 gx0 = ixy0 * (1.0 / 7.0);
  vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);

  vec4 gx1 = ixy1 * (1.0 / 7.0);
  vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);

  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
  g000 *= norm0.x;
  g010 *= norm0.y;
  g100 *= norm0.z;
  g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
  g001 *= norm1.x;
  g011 *= norm1.y;
  g101 *= norm1.z;
  g111 *= norm1.w;

  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  float n111 = dot(g111, Pf1);

  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
  return 2.2 * n_xyz;
}

// https://github.com/dmnsgn/glsl-rotate
mat3 rotation3dY(float angle) {
    float s = sin(angle);
    float c = cos(angle);

    return mat3(
      c, 0.0, -s,
      0.0, 1.0, 0.0,
      s, 0.0, c
    );
  }
  
vec3 rotateY(vec3 v, float angle) {
  return rotation3dY(angle) * v;
}

//

uniform float uFrequency;
uniform float uAmplitude;
uniform float uDensity;
uniform float uStrength;

varying float vDistortion;

void main() {  
  float distortion = pnoise(normal * uDensity, vec3(10.)) * uStrength;

  vec3 pos = position + (normal * distortion);
  float angle = sin(uv.y * uFrequency) * uAmplitude;
  pos = rotateY(pos, angle);    
    
  vDistortion = distortion;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.);
}
`;

export const fragmentShader = `uniform float uOpacity;
uniform float uDeepPurple;
 
varying float vDistortion;

vec3 cosPalette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
  return a + b * cos(6.28318 * (c * t + d));
  
}     
 
void main() {
  float distort = vDistortion * 3.;

  vec3 brightness = vec3(0.5, 0.5, 0.5);
  vec3 contrast = vec3(.5,.5,.5);
  vec3 oscilation = vec3(1,1,1);
  vec3 phase = vec3(0.00, 0.33, 0.67);
 
  vec3 color = cosPalette(distort, brightness, contrast, oscilation, phase);
  
  gl_FragColor += vec4(1.0, 0.3, 0.2, min(uOpacity, 0.5));
}
`;

export const faqData = [
  {
    id: 1,
    title: 'What is a DAO?',
    text: 'A DAO is an organization with a decentralized governance structure led by its members. The cornerstone of a DAO is its customized SmArt contract, a self-executing real-time computer program. ',
  },
  {
    id: 2,
    title: 'What is Otters DAO, and how can I join?',
    text: "Otters DAO or the SmArt Otters DAO is an art gallery with a decentralized governance structure. To be a member of the SmArt Otters' Art Gallery and help build its future, holding a SmArt Otters' NFT is the first step. Each NFT represents one vote in the Otters DAO system.",
  },
  {
    id: 3,
    title: 'What is the utility behind the SmArt Otters Society? ',
    text: 'SmArt Otters Society members run the Otters DAO together and, with the help of a unique customized SmArt contract, make critical decisions about the future of their community. They make proposals about future operations and projects, vote on them, and select those that achieve some predefined consensus level.',
  },
  {
    id: 4,
    title: 'When will the SmArt Otters Society drop? ',
    text: 'We have an infographic to explain the mechanism of Otters DAO. You can also read our litepaper for more details.',
  },
  {
    id: 5,
    title: 'How can I get a SmArt Otter? ',
    text: "We will mint through our website, and the date will be announced soon. Otters' NFTs will be on OpenSea for secondary sales.",
  },
  {
    id: 6,
    title: 'Is there a whitelist? ',
    text: "Yes, of course! And it's still open! The active and helpful members will be rewarded with whitelist positions. This is a holistic process as we take your engagement, invites, and Twitter shoutouts into account. Check out our Discord for more info! ",
  },
  {
    id: 7,
    title: 'How many Otters will be held for marketing? ',
    text: 'There will be 100 otters total. The breakdown is 30 for the founding team and 70 for marketing and other business purposes. ',
  },
  {
    id: 8,
    title: 'What is the utility behind the SmArt Otters Society? ',
    text: 'We are a society of smART Otters in love with innovative artworks. We want to aid young and talented artists to have a platform to present their work to the world. We check out artworks, choose the best ones and bring them forward to the world. To achieve this goal, we rolled up our sleeves and started our mission to create a new path for art transactions, a path to exchange data and money easily and without complexity.',
  },
  {
    id: 9,
    title: 'What is a DAO?',
    text: 'A decentralized autonomous organization, or DAO, is a blockchain-based form of organization or company that is often governed by a native crypto token. Anyone who purchases and holds these tokens gains the ability to vote on important matters directly related to the DAO.',
  },
  {
    id: 10,
    title: 'Why make an organization like a DAO?',
    text: 'The developers believe they could eliminate human error or manipulation of investor funds by placing decision-making power into the hands of an automated system and a crowdsourced process.',
  },
  {
    id: 11,
    title: 'What is the combination of NFT and DAO?',
    text: 'By having smart otters NFTs that live on the Ethereum blockchain, you will have the right to vote in society and participate in decisions and determine the path of growth. ',
  },
  {
    id: 12,
    title: 'Would you explain more about the infographic?',
    text: 'The infographic tries to show the structure and mechanism of DAO. Read our light paper for more details',
  },
  {
    id: 13,
    title: 'That sounds great, how do I get in?',
    text: 'Join our Discord (https://discord.gg/.........) server or Twitter (https://twitter.com/............) account and jump in on the conversation & share your ideas!',
  },
];
