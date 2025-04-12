# 프론트엔드 SOLID 원칙 가이드

## SOLID 원칙 개요

1. **단일 책임 원칙 (SRP)**: 하나의 컴포넌트는 하나의 책임만 가진다
2. **개방-폐쇄 원칙 (OCP)**: 확장에 열려있고, 수정에 닫혀있다
3. **리스코프 치환 원칙 (LSP)**: 하위 타입은 상위 타입을 대체할 수 있어야 한다
4. **인터페이스 분리 원칙 (ISP)**: 사용하지 않는 인터페이스에 의존하지 않는다
5. **의존성 역전 원칙 (DIP)**: 구체적인 구현보다 추상화에 의존한다

## 프론트엔드 적용 사례

### 단일 책임 원칙 (SRP)

```tsx
// ❌ 나쁜 예: 모든 책임이 하나의 컴포넌트에 집중
const ForestFireMap = () => {
  const [fires, setFires] = useState([]);
  // 데이터 로딩, 에러 처리, UI 렌더링 등 모든 책임을 가짐
}

// ✅ 좋은 예: 책임 분리
const useForestFireData = () => {
  // 데이터 관련 로직만 담당
};

const ForestFireMap = () => {
  const { fires } = useForestFireData();
  // UI 렌더링에만 집중
};

const FireMarker = ({ fire }) => {
  // 마커 렌더링에만 집중
};
```

### 개방-폐쇄 원칙 (OCP)

```tsx
// ✅ 좋은 예: 확장에 열린 설계
interface FireButtonProps {
  variant?: 'default' | 'active' | 'contained';
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
}

const FireButton: React.FC<FireButtonProps> = ({
  variant = 'default',
  className = '',
  onClick,
  children
}) => {
  // 객체 매핑으로 새 변형 추가 시 코드 수정 없이 확장 가능
  const variantClasses = {
    default: '',
    active: 'fire-button--active',
    contained: 'fire-button--contained'
  };
  
  return (
    <button className={`fire-button ${variantClasses[variant]} ${className}`} onClick={onClick}>
      {children}
    </button>
  );
};
```

### 리스코프 치환 원칙 (LSP)

```tsx
// ✅ 좋은 예: 상위 타입을 대체 가능한 하위 타입
interface InputProps {
  value: string;
  onChange: (value: string) => void;
  validate?: (value: string) => boolean;
}

// 기본 Input 컴포넌트
const Input: React.FC<InputProps> = ({ value, onChange, validate = () => true }) => {
  // ...
};

// 하위 타입 - 상위 타입과 호환됨
const NumericInput: React.FC<Omit<InputProps, 'validate'>> = (props) => {
  return <Input {...props} validate={(value) => /^\d*$/.test(value)} />;
};
```

### 인터페이스 분리 원칙 (ISP)

```tsx
// ✅ 좋은 예: 목적별로 분리된 인터페이스
interface MapProps {
  fires: FireData[];
  center: [number, number];
  zoom: number;
}

interface FilterProps {
  selected: string;
  options: Option[];
  onChange: (value: string) => void;
}

// 각 컴포넌트는 필요한 props만 받음
const ForestFireMap: React.FC<MapProps> = (props) => {
  // 지도 관련 UI만 담당
};

const FilterControls: React.FC<FilterProps> = (props) => {
  // 필터링 UI만 담당
};
```

### 의존성 역전 원칙 (DIP)

```tsx
// ✅ 좋은 예: 추상화에 의존
interface ForestFireService {
  getForestFires(): Promise<FireData[]>;
}

// 구체적인 구현
class ApiForestFireService implements ForestFireService {
  async getForestFires() {
    // API 호출 구현
  }
}

// 컴포넌트는 구체적인 구현이 아닌 인터페이스에 의존
const ForestFireList: React.FC = () => {
  const fireService = useForestFireService(); // 서비스 추상화
  
  useEffect(() => {
    fireService.getForestFires().then(setFires);
  }, [fireService]);
  
  // 렌더링 로직
};
```

## 실무 적용 팁

1. **컴포넌트 분해**: 큰 컴포넌트는 작은 단위로 분해하여 책임 분산
2. **커스텀 훅 활용**: 데이터 로직과 비즈니스 로직을 커스텀 훅으로 분리
3. **인터페이스 정의**: 컴포넌트 props와 서비스 인터페이스를 명확히 정의
4. **추상화 계층 도입**: API 호출은 서비스 계층을 통해 추상화
5. **조합을 통한 확장**: 상속보다 조합을 통한 컴포넌트 확장 지향
